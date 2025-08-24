from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import os
import json
import re
import requests
from dotenv import load_dotenv

# --- Load environment variables ---
load_dotenv()

app = Flask(__name__)

# --- Configure Gemini API ---
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Use Gemini model
model = genai.GenerativeModel("gemini-1.5-flash")

# YouTube Data API Key for searching videos
YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "")

# Recipe-specific YouTube URLs - UPDATED WITH WORKING VIDEOS
RECIPE_VIDEOS = {
    # Vegetarian recipes
    "Creamy Mushroom Pasta": "VGRT_6ZgKc4",
    "Vegetable Stir Fry": "N4WX0i85k_0",
    "Margherita Pizza": "x_9cfJsex_c",
    "Paneer Butter Masala": "2Kz5X2Fh5oE",
    "Vegetable Biryani": "w3B8-7hTtC8",
    "Palak Paneer": "oBGJ0-hcL0E",
    "Masala Dosa": "CCab5o0lJ1I",
    "Chana Masala": "8ln0_7qFnjc",
    "Aloo Gobi": "2gT2VhVv0xE",
    "Dal Makhani": "8ln0_7qFnjc",
    "Paneer Tikka": "2Kz5X2Fh5oE",
    "Vegetable Curry": "N4WX0i85k_0",
    "Tomato Soup": "VGRT_6ZgKc4",
    "Potato Curry": "2gT2VhVv0xE",
    
    # Non-vegetarian recipes
    "Chicken Tikka Masala": "lXgktUyO8Io",
    "Beef Stroganoff": "bS1ePEZZCDw",
    "Grilled Salmon": "vRkD5TDnsfo",
    "Butter Chicken": "a03U45jFxOI",
    "Chicken Biryani": "95BCU1n268w",
    "Fish Curry": "6k2R8ZhPAtM",
    "Lamb Rogan Josh": "7-0pRfB_2c4",
    "Chicken Curry": "6k2R8ZhPAtM",
    "Tandoori Chicken": "-CKvt1KNU74",
    "Egg Curry": "6k2R8ZhPAtM",
    "Chicken Fried Rice": "lXgktUyO8Io",
    "Mutton Curry": "7-0pRfB_2c4",
    "Prawn Curry": "6k2R8ZhPAtM",
    
    # Fallback videos
    "default_veg": "VGRT_6ZgKc4",
    "default_nonveg": "lXgktUyO8Io"
}

def get_youtube_video(search_query):
    """Search for a YouTube video based on the recipe name"""
    try:
        if YOUTUBE_API_KEY:
            # Search YouTube for the recipe
            search_url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet",
                "q": f"{search_query} recipe",
                "type": "video",
                "maxResults": 1,
                "key": YOUTUBE_API_KEY
            }
            
            response = requests.get(search_url, params=params)
            data = response.json()
            
            if "items" in data and len(data["items"]) > 0:
                return data["items"][0]["id"]["videoId"]
        
        # Fallback to our predefined videos or search by name
        for key, value in RECIPE_VIDEOS.items():
            if key.lower() in search_query.lower():
                return value
                
        # Final fallback
        if "chicken" in search_query.lower() or "meat" in search_query.lower() or "beef" in search_query.lower():
            return RECIPE_VIDEOS["default_nonveg"]
        else:
            return RECIPE_VIDEOS["default_veg"]
            
    except Exception as e:
        print(f"YouTube search error: {e}")
        if "chicken" in search_query.lower() or "meat" in search_query.lower() or "beef" in search_query.lower():
            return RECIPE_VIDEOS["default_nonveg"]
        else:
            return RECIPE_VIDEOS["default_veg"]

# --- System prompt for recipe ideas ---
SYSTEM_PROMPT = """
You are a smart recipe generator.
The user will give some ingredients. 
You must:
1. Suggest 3–5 recipe ideas that can be made from those ingredients (Veg or Non-Veg depending on user input).
2. Each recipe should include:
   - Name of the recipe
   - Short description (1–2 lines)
3. Keep answers clear and easy to read.
4. If ingredients are too few, still suggest best possible dishes.
5. Format your response as a JSON object with this structure:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Short description of the recipe"
    }
  ]
}
Return only JSON, nothing else.
"""

# ---------------------------
# Page Routes
# ---------------------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ingredients")
def ingredients_page():
    return render_template("ingredients.html")

@app.route("/trending-page")
def trending_page():
    return render_template("trending.html")

# ---------------------------
# API Routes
# ---------------------------
@app.route("/suggest", methods=["POST"])
def suggest():
    data = request.get_json()
    ingredients = data.get("ingredients", "")
    diet = data.get("diet", "any")
    time_limit = data.get("timeLimit", "45")
    cuisine = data.get("cuisine", "")

    if not ingredients.strip():
        return jsonify({"error": "Please enter some ingredients."}), 400

    # Create user prompt
    user_prompt = f"""
Ingredients: {ingredients}
Diet: {diet}
Time limit: {time_limit} minutes
Cuisine: {cuisine if cuisine else 'any'}
Now suggest recipes in JSON format.
"""

    try:
        response = model.generate_content(SYSTEM_PROMPT + "\n\n" + user_prompt)
        text = response.text.strip()
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            recipes = data.get("recipes", [])
            
            # Add YouTube URLs to recipes
            for recipe in recipes:
                title = recipe["title"]
                video_id = get_youtube_video(title)
                recipe["youtubeUrl"] = f"https://www.youtube.com/watch?v={video_id}"
            
            return jsonify({"recipes": recipes})
        else:
            return jsonify({"error": "Failed to parse recipe suggestions."}), 500
            
    except Exception as e:
        # Fallback sample recipes
        sample_recipes = [
            {"title": "Vegetable Stir Fry", "description": "A quick and healthy stir fry with fresh vegetables and a savory sauce.", "youtubeUrl": f"https://www.youtube.com/watch?v={RECIPE_VIDEOS['Vegetable Stir Fry']}"},
            {"title": "Pasta with Tomato Sauce", "description": "Simple pasta with a rich tomato sauce and herbs.", "youtubeUrl": f"https://www.youtube.com/watch?v={RECIPE_VIDEOS['default_veg']}"},
            {"title": "Rice Bowl with Vegetables", "description": "Nutritious rice bowl topped with fresh vegetables and a tasty dressing.", "youtubeUrl": f"https://www.youtube.com/watch?v={RECIPE_VIDEOS['default_veg']}"}
        ]
        return jsonify({"recipes": sample_recipes})


@app.route("/trending", methods=["GET"])
def trending():
    try:
        response = model.generate_content("""
Suggest 3 trending VEG and 3 trending NON-VEG recipes with short descriptions.
Format as JSON with this structure:
{
  "veg": [
    {
      "title": "Recipe Name",
      "description": "Short description of the recipe"
    }
  ],
  "nonveg": [
    {
      "title": "Recipe Name",
      "description": "Short description of the recipe"
    }
  ]
}
Return only JSON, nothing else.
""")
        
        # Parse the JSON response
        text = response.text.strip()
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        
        if json_match:
            recipes = json.loads(json_match.group())
            
            # Add YouTube URLs to the recipes
            for recipe in recipes.get("veg", []):
                title = recipe["title"]
                video_id = get_youtube_video(title)
                recipe["youtubeUrl"] = f"https://www.youtube.com/watch?v={video_id}"
            
            for recipe in recipes.get("nonveg", []):
                title = recipe["title"]
                video_id = get_youtube_video(title)
                recipe["youtubeUrl"] = f"https://www.youtube.com/watch?v={video_id}"
                    
            return jsonify(recipes)
        else:
            # If JSON parsing fails, use fallback data
            raise ValueError("JSON parsing failed")
            
    except Exception as e:
        # Fallback to sample data if API fails
        sample_data = {
            "veg": [
                {"title": "Paneer Butter Masala", "description": "Creamy and rich Indian cottage cheese in a tomato-based gravy.", "youtubeUrl": f"https://www.youtube.com/watch?v={RECIPE_VIDEOS['Paneer Butter Masala']}"},
                {"title": "Vegetable Biryani", "description": "Fragrant rice dish with mixed vegetables and aromatic spices.", "youtubeUrl": f"https://www.youtube.com/watch?v={RECIPE_VIDEOS['Vegetable Biryani']}"},
                {"title": "Palak Paneer", "description": "Soft cottage cheese cubes in a smooth spinach gravy.", "youtubeUrl": f"https://www.youtube.com/watch?v={RECIPE_VIDEOS['Palak Paneer']}"}
            ],
            "nonveg": [
                {"title": "Butter Chicken", "description": "Tender chicken in a creamy tomato and butter sauce.", "youtubeUrl": f"https://www.youtube.com/watch?v={RECIPE_VIDEOS['Butter Chicken']}"},
                {"title": "Chicken Biryani", "description": "Fragrant rice dish with marinated chicken and spices.", "youtubeUrl": f"https://www.youtube.com/watch?v={RECIPE_VIDEOS['Chicken Biryani']}"},
                {"title": "Fish Curry", "description": "Fish cooked in a spicy and tangy coconut gravy.", "youtubeUrl": f"https://www.youtube.com/watch?v={RECIPE_VIDEOS['Fish Curry']}"}
            ]
        }
        return jsonify(sample_data)


@app.route("/recipe-details", methods=["POST"])
def recipe_details():
    data = request.get_json()
    recipe_name = data.get("title", "")

    if not recipe_name.strip():
        return jsonify({"error": "No recipe title provided"}), 400

    # Enhanced prompt for better recipe details
    user_prompt = f"""
Provide detailed recipe information for "{recipe_name}" in JSON format. 
Include the following structure:

{{
  "title": "{recipe_name}",
  "description": "A comprehensive description of this delicious recipe including its origin, flavors, and best serving suggestions",
  "isVeg": true,
  "timeMinutes": 40,
  "cuisine": "International",
  "difficulty": "Medium",
  "ingredients": [
    "Specific ingredient 1 with quantity",
    "Specific ingredient 2 with quantity",
    "Specific ingredient 3 with quantity"
  ],
  "steps": [
    "Step 1: Detailed cooking instruction",
    "Step 2: Detailed cooking instruction", 
    "Step 3: Detailed cooking instruction"
  ]
}}

Make sure the ingredients and steps are specific to {recipe_name} and include actual quantities and detailed instructions.
Return only valid JSON, nothing else.
"""

    try:
        response = model.generate_content(user_prompt)
        text = response.text.strip()
        
        # Clean the response text
        text = text.replace('```json', '').replace('```', '').strip()
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        
        if json_match:
            recipe = json.loads(json_match.group())
            
            # Get YouTube video for this recipe
            video_id = get_youtube_video(recipe_name)
            recipe["youtubeUrl"] = f"https://www.youtube.com/watch?v={video_id}"
                
            return jsonify({"recipe": recipe})
        else:
            # If JSON parsing fails, use fallback data
            raise ValueError("JSON parsing failed")
            
    except Exception as e:
        # Enhanced fallback sample recipe
        is_veg = ("vegetarian" in recipe_name.lower() or 
                 "veg" in recipe_name.lower() or 
                 "paneer" in recipe_name.lower() or 
                 "dal" in recipe_name.lower() or
                 "vegetable" in recipe_name.lower() or
                 "aloo" in recipe_name.lower() or
                 "palak" in recipe_name.lower())
        
        # Get YouTube video for this recipe
        video_id = get_youtube_video(recipe_name)
        
        sample_recipe = {
            "title": recipe_name,
            "description": f"A delicious {recipe_name} that combines fresh ingredients with aromatic spices to create a memorable dining experience. Perfect for family dinners or special occasions.",
            "isVeg": is_veg,
            "timeMinutes": 35,
            "cuisine": "International",
            "difficulty": "Medium",
            "ingredients": [
                "2 cups main ingredient, chopped",
                "1 tbsp olive oil or cooking oil",
                "1 onion, finely chopped",
                "2 garlic cloves, minced",
                "1 tsp ground spices (appropriate for the recipe)",
                "Salt and pepper to taste",
                "Fresh herbs for garnish"
            ],
            "steps": [
                f"Step 1: Prepare all ingredients by washing, chopping, and measuring as needed for {recipe_name}",
                f"Step 2: Heat oil in a pan and sauté onions until translucent, then add garlic and cook until fragrant",
                f"Step 3: Add main ingredients and spices, cook according to traditional methods for {recipe_name}",
                "Step 4: Simmer until all flavors are well combined and the dish reaches desired consistency",
                "Step 5: Adjust seasoning, garnish with fresh herbs, and serve hot"
            ],
            "youtubeUrl": f"https://www.youtube.com/watch?v={video_id}"
        }
        return jsonify({"recipe": sample_recipe})


# ---------------------------
if __name__ == "__main__":
    app.run(debug=True)
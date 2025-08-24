// Enhanced Recipe Generator JavaScript with Animations and Interactions

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

// Initialize application
function initializeApp() {
  setupNavigation();
  setupFormAnimations();
  setupButtonRippleEffect();
  setupScrollAnimations();
  setupFloatingActionButton();
  initializeHomePage();
  initializeIngredientsForm();
  
  // Initialize trending page if we're on that page
  if (document.getElementById('trendingResults')) {
    initializeTrendingPage();
  }
}

// Navigation Setup
function setupNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
  }

  // Active navigation highlighting
  const currentPath = window.location.pathname;
  const navLinkElements = document.querySelectorAll('.nav-link');
  
  navLinkElements.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

// Button ripple effect
function setupButtonRippleEffect() {
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = this.querySelector('.btn-ripple');
      if (!ripple) return;
      
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.transform = 'scale(0)';
      ripple.style.opacity = '1';
      
      // Trigger animation
      ripple.offsetHeight; // Force reflow
      ripple.style.transform = 'scale(4)';
      ripple.style.opacity = '0';
    });
  });
}

// Form animations and interactions
function setupFormAnimations() {
  const inputs = document.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    // Add focus and blur animations
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
      
      // Animate label if exists
      const label = this.parentElement.querySelector('label');
      if (label) {
        label.style.transform = 'translateY(-5px)';
        label.style.fontSize = '0.9rem';
      }
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
      
      // Reset label if empty
      const label = this.parentElement.querySelector('label');
      if (label && !this.value) {
        label.style.transform = 'translateY(0)';
        label.style.fontSize = '1rem';
      }
    });
    
    // Add typing animation effect
    if (input.type === 'text' || input.type === 'number') {
      input.addEventListener('input', function() {
        this.style.transform = 'scale(1.02)';
        setTimeout(() => {
          this.style.transform = 'scale(1)';
        }, 150);
      });
    }
  });
}

// Scroll animations
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);
  
  // Observe elements for scroll animation
  const animateElements = document.querySelectorAll('.feature-card, .stat-card, .enhanced-recipe-card');
  animateElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(el);
  });
}

// Floating Action Button
function setupFloatingActionButton() {
  const fab = document.querySelector('.main-fab');
  const fabOptions = document.querySelector('.fab-options');
  
  if (fab && fabOptions) {
    let isOpen = false;
    
    fab.addEventListener('click', () => {
      isOpen = !isOpen;
      fabOptions.style.opacity = isOpen ? '1' : '0';
      fabOptions.style.transform = isOpen ? 'scale(1)' : 'scale(0)';
      fab.style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0deg)';
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!fab.contains(e.target) && !fabOptions.contains(e.target) && isOpen) {
        isOpen = false;
        fabOptions.style.opacity = '0';
        fabOptions.style.transform = 'scale(0)';
        fab.style.transform = 'rotate(0deg)';
      }
    });
  }
}

// Home page animations
function initializeHomePage() {
  // Animate home buttons on load
  const homeButtons = document.querySelectorAll('.home-buttons .btn');
  homeButtons.forEach((btn, index) => {
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      btn.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    }, 200 + (index * 200));
  });
  
  // Animate stats counter
  animateStatsCounters();
  
  // Add parallax effect to hero section
  setupParallaxEffect();
}

// Stats counter animation
function animateStatsCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  statNumbers.forEach(stat => {
    const targetValue = stat.textContent;
    const numericValue = parseInt(targetValue.replace(/\+|k/g, ''));
    const isThousands = targetValue.includes('k');
    const hasPlus = targetValue.includes('+');
    
    let currentValue = 0;
    const increment = numericValue / 50;
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= numericValue) {
        currentValue = numericValue;
        clearInterval(timer);
      }
      
      let displayValue = Math.floor(currentValue);
      if (isThousands) displayValue += 'k';
      if (hasPlus) displayValue += '+';
      
      stat.textContent = displayValue;
    }, 50);
  });
}

// Parallax effect
function setupParallaxEffect() {
  const floatingIcons = document.querySelectorAll('.floating-icon');
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    
    floatingIcons.forEach((icon, index) => {
      const speed = 0.5 + (index * 0.1);
      const yPos = -(scrollTop * speed);
      icon.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  });
}

// Time range functions
window.updateTimeDisplay = function(value) {
  const display = document.getElementById('timeDisplay');
  const input = document.getElementById('timeInput');
  if (display) display.textContent = value;
  if (input) input.value = value;
};

window.updateTimeRange = function(value) {
  const range = document.getElementById('timeRange');
  const display = document.getElementById('timeDisplay');
  if (range) range.value = value;
  if (display) display.textContent = value;
};

// Add ingredient suggestions
window.addIngredient = function(ingredients) {
  const input = document.getElementById('ingredientsInput');
  if (input) {
    input.value = ingredients;
    input.focus();
    
    // Add animation effect
    input.style.background = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
    setTimeout(() => {
      input.style.background = '#ffffff';
    }, 1000);
  }
};

// Enhanced ingredients form submission
function initializeIngredientsForm() {
  const ingredientsForm = document.getElementById("ingredientsForm");
  if (!ingredientsForm) return;
  
  ingredientsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Get form elements
    const submitBtn = ingredientsForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show enhanced loading state
    showLoadingState(submitBtn);
    
    // Get form data
    const formData = getFormData();
    
    try {
      const response = await fetch("/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      await displayRecipeResults(data);
      
    } catch (error) {
      displayError("Failed to fetch recipes. Please try again.");
    } finally {
      resetButtonState(submitBtn, originalText);
    }
  });
}

// Enhanced loading state
function showLoadingState(button) {
  const spinner = '<div class="spinner" style="width: 20px; height: 20px; margin-right: 8px;"></div>';
  button.innerHTML = spinner + 'Generating Amazing Recipes...';
  button.disabled = true;
  button.style.transform = 'scale(0.98)';
}

// Reset button state
function resetButtonState(button, originalText) {
  button.innerHTML = originalText;
  button.disabled = false;
  button.style.transform = 'scale(1)';
}

// Get form data
function getFormData() {
  return {
    ingredients: document.getElementById("ingredientsInput").value,
    diet: document.getElementById("dietSelect").value,
    timeLimit: document.getElementById("timeInput").value,
    cuisine: document.getElementById("cuisineInput").value
  };
}

// Display recipe results with animations
async function displayRecipeResults(data) {
  const resultDiv = document.getElementById("recipeResults");
  
  if (data.error) {
    displayError(data.error);
    return;
  }
  
  // Create enhanced recipe cards
  const recipeCards = data.recipes.map((recipe, i) => createRecipeCard(recipe, i, 'suggested')).join('');
  
  resultDiv.innerHTML = `
    <h3 class="results-title">
      <i class="fas fa-lightbulb"></i>
      <span>Your Personalized Recipe Suggestions</span>
    </h3>
    <div class="enhanced-recipe-list">
      ${recipeCards}
    </div>
    <div id="suggestedRecipeDetail"></div>
  `;
  
  // Animate results
  animateResults();
  
  // Smooth scroll to results
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Create enhanced recipe card - FIXED FOR TRENDING PAGE
function createRecipeCard(recipe, index, type) {
  const recipeId = `${type}-${index}`;
  const isVeg = determineVegStatus(recipe.title);
  const estimatedTime = 30 + (index * 5);
  
  // Determine which function to call based on page context
  const onClickFunction = type.includes('trending') ? 'showRecipe' : 'showSuggestedRecipe';
  
  return `
    <div class="enhanced-recipe-card" style="opacity: 0; transform: translateY(20px);">
      <div class="recipe-card-header">
        <h3 class="recipe-title">${recipe.title}</h3>
        <div class="recipe-actions">
          <span class="recipe-badge ${isVeg ? 'badge-veg' : 'badge-nonveg'}">
            <i class="fas ${isVeg ? 'fa-leaf' : 'fa-drumstick-bite'}"></i>
            ${isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          </span>
          <span class="recipe-badge badge-time">
            <i class="fas fa-clock"></i>
            ${estimatedTime} min
          </span>
        </div>
      </div>
      
      <div class="recipe-card-body">
        <div class="description-container" id="description-${recipeId}" style="display: none;">
          <div class="recipe-description">
            ${recipe.description || generateDescription(recipe.title)}
          </div>
        </div>
      </div>
      
      <div class="recipe-card-footer">
        <button class="toggle-btn" id="toggle-btn-${recipeId}" onclick="toggleDescription('${recipeId}')">
          <i class="fas fa-chevron-down"></i>
          <span>Show Description</span>
        </button>
        
        ${recipe.youtubeUrl ? `
          <button class="youtube-btn" onclick="openYouTubeVideo('${recipe.youtubeUrl}', '${recipe.title.replace(/'/g, "\\'")}')">
            <i class="fab fa-youtube"></i>
            <span>Watch Recipe</span>
          </button>
        ` : ''}
        
        <button class="btn btn-primary" onclick="${onClickFunction}('${recipe.title.replace(/'/g, "\\'")}')">
          <i class="fas fa-utensils"></i>
          <span>View Full Recipe</span>
        </button>
      </div>
    </div>
  `;
}

// Determine vegetarian status
function determineVegStatus(title) {
  const vegKeywords = ['vegetable', 'paneer', 'dal', 'tofu', 'mushroom', 'spinach'];
  const nonVegKeywords = ['chicken', 'beef', 'fish', 'lamb', 'pork', 'meat'];
  
  const titleLower = title.toLowerCase();
  
  if (nonVegKeywords.some(keyword => titleLower.includes(keyword))) {
    return false;
  }
  
  return vegKeywords.some(keyword => titleLower.includes(keyword)) || 
         !nonVegKeywords.some(keyword => titleLower.includes(keyword));
}

// Generate description for recipes
function generateDescription(title) {
  const descriptions = [
    "A delicious and flavorful dish that will tantalize your taste buds!",
    "Perfect comfort food that brings warmth to your heart and soul.",
    "A nutritious and satisfying meal that's easy to prepare at home.",
    "An aromatic dish with rich flavors and perfect texture.",
    "A crowd-pleasing recipe that's perfect for any occasion."
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Animate results appearance
function animateResults() {
  const cards = document.querySelectorAll('.enhanced-recipe-card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 150);
  });
}

// Display error with animation
function displayError(message) {
  const resultDiv = document.getElementById("recipeResults");
  resultDiv.innerHTML = `
    <div class="error-message" style="opacity: 0; transform: scale(0.8);">
      <i class="fas fa-exclamation-circle"></i>
      <p>${message}</p>
    </div>
  `;
  
  const errorEl = resultDiv.querySelector('.error-message');
  setTimeout(() => {
    errorEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    errorEl.style.opacity = '1';
    errorEl.style.transform = 'scale(1)';
  }, 100);
}

// Toggle recipe description with animation - FIXED FOR TRENDING PAGE
window.toggleDescription = function(recipeId) {
  const description = document.getElementById(`description-${recipeId}`);
  const button = document.getElementById(`toggle-btn-${recipeId}`);
  
  if (!description || !button) return;
  
  const isVisible = description.style.display !== 'none';
  
  if (isVisible) {
    // Hide with animation
    description.style.opacity = '0';
    description.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      description.style.display = 'none';
      button.innerHTML = '<i class="fas fa-chevron-down"></i><span>Show Description</span>';
    }, 300);
  } else {
    // Show with animation
    description.style.display = 'block';
    description.style.opacity = '0';
    description.style.transform = 'translateY(-10px)';
    description.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    setTimeout(() => {
      description.style.opacity = '1';
      description.style.transform = 'translateY(0)';
      button.innerHTML = '<i class="fas fa-chevron-up"></i><span>Hide Description</span>';
    }, 50);
  }
};

// Open YouTube video with modal effect - FIXED URL FORMAT
window.openYouTubeVideo = function(youtubeUrl, title) {
  // Ensure we have a proper YouTube URL
  let finalUrl = youtubeUrl;
  
  // If it's just a video ID, construct the full URL
  if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
    finalUrl = `https://www.youtube.com/watch?v=${youtubeUrl}`;
  }
  // If it's a shortened youtu.be URL, convert to full URL
  else if (youtubeUrl.includes('youtu.be')) {
    const videoId = youtubeUrl.split('/').pop();
    finalUrl = `https://www.youtube.com/watch?v=${videoId}`;
  }
  
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'youtube-modal-overlay';
  modal.innerHTML = `
    <div class="youtube-modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="close-modal" onclick="closeYouTubeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p>Opening video in new tab...</p>
        <div class="spinner"></div>
      </div>
    </div>
  `;
  
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(modal);
  
  // Animate modal appearance
  setTimeout(() => {
    modal.style.opacity = '1';
  }, 10);
  
  // Open video and close modal
  setTimeout(() => {
    window.open(finalUrl, '_blank');
    closeYouTubeModal();
  }, 1500);
};

window.closeYouTubeModal = function() {
  const modal = document.querySelector('.youtube-modal-overlay');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
};

// Enhanced trending recipes loading
window.loadTrending = async function() {
  const trendingBtn = document.querySelector('.trending-actions .btn');
  const trendingContainer = document.getElementById('trendingResults');
  
  if (!trendingContainer) return;
  
  // Show loading state
  if (trendingBtn) {
    showLoadingState(trendingBtn);
  }
  
  showTrendingLoading(trendingContainer);
  
  try {
    const response = await fetch("/trending");
    const data = await response.json();
    
    if (data.error) {
      displayTrendingError(trendingContainer, data.error);
    } else {
      await displayTrendingResults(trendingContainer, data);
    }
  } catch (error) {
    displayTrendingError(trendingContainer, "Failed to load trending recipes. Please try again.");
  } finally {
    if (trendingBtn) {
      resetButtonState(trendingBtn, '<i class="fas fa-rocket"></i><span>Discover Trending Recipes</span><div class="btn-ripple"></div>');
    }
  }
};

// Show trending loading with animation
function showTrendingLoading(container) {
  container.innerHTML = `
    <div class="loading-message" style="opacity: 0;">
      <div class="spinner"></div>
      <h3>Discovering Amazing Recipes...</h3>
      <p>Finding the most popular dishes just for you!</p>
    </div>
  `;
  
  const loadingEl = container.querySelector('.loading-message');
  setTimeout(() => {
    loadingEl.style.transition = 'opacity 0.5s ease';
    loadingEl.style.opacity = '1';
  }, 100);
}

// Display trending results - FIXED: Use the correct function for trending page
async function displayTrendingResults(container, data) {
  const vegCards = data.veg.map((recipe, i) => createRecipeCard(recipe, i, 'trending-veg')).join('');
  const nonVegCards = data.nonveg.map((recipe, i) => createRecipeCard(recipe, i, 'trending-nonveg')).join('');
  
  container.innerHTML = `
    <div class="trending-section">
      <h3 class="results-title">
        <i class="fas fa-leaf"></i>
        <span>Trending Vegetarian Recipes</span>
      </h3>
      <div class="enhanced-recipe-list">
        ${vegCards}
      </div>
    </div>
    
    <div class="trending-section" style="margin-top: 3rem;">
      <h3 class="results-title">
        <i class="fas fa-drumstick-bite"></i>
        <span>Trending Non-Vegetarian Recipes</span>
      </h3>
      <div class="enhanced-recipe-list">
        ${nonVegCards}
      </div>
    </div>
    
    <div id="fullRecipe"></div>
  `;
  
  // Animate trending results
  animateResults();
}

// Display trending error
function displayTrendingError(container, message) {
  container.innerHTML = `
    <div class="error-message" style="opacity: 0;">
      <i class="fas fa-exclamation-circle"></i>
      <p>${message}</p>
      <button class="btn btn-secondary" onclick="loadTrending()" style="margin-top: 1rem;">
        <i class="fas fa-sync-alt"></i>
        <span>Try Again</span>
      </button>
    </div>
  `;
  
  const errorEl = container.querySelector('.error-message');
  setTimeout(() => {
    errorEl.style.transition = 'opacity 0.4s ease';
    errorEl.style.opacity = '1';
  }, 100);
}

// Initialize trending page
function initializeTrendingPage() {
  // Add event listener for the trending button
  const trendingBtn = document.querySelector('.trending-actions .btn');
  if (trendingBtn) {
    trendingBtn.addEventListener('click', loadTrending);
  }
  
  // Make sure the showRecipe function is available globally
  window.showRecipe = async function(title) {
    await showRecipeDetails(title, 'fullRecipe');
  };
}

// Show recipe details for trending page
window.showRecipe = async function(title) {
  await showRecipeDetails(title, 'fullRecipe');
};

window.showSuggestedRecipe = async function(title) {
  await showRecipeDetails(title, 'suggestedRecipeDetail');
};

// Enhanced recipe details display
async function showRecipeDetails(title, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }
  
  // Show loading with better animation
  container.innerHTML = `
    <div class="loading-message" style="opacity: 0; transform: translateY(20px);">
      <div class="spinner"></div>
      <h4>Preparing Your Recipe</h4>
      <p>Loading delicious details for "${title}"...</p>
    </div>
  `;
  
  // Animate loading message
  setTimeout(() => {
    const loadingEl = container.querySelector('.loading-message');
    if (loadingEl) {
      loadingEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      loadingEl.style.opacity = '1';
      loadingEl.style.transform = 'translateY(0)';
    }
  }, 100);

  try {
    const response = await fetch("/recipe-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      displayRecipeError(container, data.error);
    } else {
      displayRecipeDetail(container, data.recipe);
    }
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    displayRecipeError(container, "Failed to load recipe details. Please try again.");
  }
}

// Display recipe error
function displayRecipeError(container, message) {
  container.innerHTML = `
    <div class="error-message" style="opacity: 0;">
      <i class="fas fa-exclamation-circle"></i>
      <h4>Recipe Unavailable</h4>
      <p>${message}</p>
      <button class="btn btn-secondary" onclick="this.closest('.error-message').style.opacity = '0'; setTimeout(() => { this.closest('.error-message').remove(); }, 300)" style="margin-top: 1rem;">
        <i class="fas fa-times"></i>
        <span>Dismiss</span>
      </button>
    </div>
  `;
  
  const errorEl = container.querySelector('.error-message');
  setTimeout(() => {
    errorEl.style.transition = 'opacity 0.4s ease';
    errorEl.style.opacity = '1';
  }, 100);
}

// Display recipe detail with animations
function displayRecipeDetail(container, recipe) {
  container.innerHTML = `
    <div class="recipe-detail" style="opacity: 0; transform: translateY(20px);">
      <div class="recipe-header-row">
        <h3 class="recipe-header">${recipe.title}</h3>
        ${recipe.youtubeUrl ? `
          <button class="youtube-btn" onclick="openYouTubeVideo('${recipe.youtubeUrl}', '${recipe.title.replace(/'/g, "\\'")}')">
            <i class="fab fa-youtube"></i>
            <span>Watch Video</span>
          </button>
        ` : ''}
      </div>
      
      <div class="recipe-meta">
        <span class="meta-item">
          <i class="fas fa-globe-americas"></i>
          ${recipe.cuisine || 'International'} Cuisine
        </span>
        <span class="meta-item">
          <i class="fas fa-clock"></i>
          ${recipe.timeMinutes || '30'} minutes
        </span>
        <span class="meta-item">
          <i class="fas fa-tachometer-alt"></i>
          ${recipe.difficulty || 'Medium'} difficulty
        </span>
        <span class="meta-item">
          <i class="fas ${recipe.isVeg ? 'fa-leaf' : 'fa-drumstick-bite'}"></i>
          ${recipe.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
        </span>
      </div>
      
      ${recipe.description ? `
        <div class="recipe-section">
          <h5 class="recipe-section-title">
            <i class="fas fa-align-left"></i>
            Description
          </h5>
          <p class="recipe-description-text">${recipe.description}</p>
        </div>
      ` : ''}
      
      <div class="recipe-section">
        <h5 class="recipe-section-title">
          <i class="fas fa-list-ul"></i>
          Ingredients
        </h5>
        <ul class="ingredient-list">
          ${recipe.ingredients.map(ingredient => `
            <li class="ingredient-item">
              <i class="fas fa-check-circle"></i>
              <span>${ingredient}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      
      <div class="recipe-section">
        <h5 class="recipe-section-title">
          <i class="fas fa-list-ol"></i>
          Instructions
        </h5>
        <ol class="instruction-list">
          ${recipe.steps.map(step => `
            <li class="instruction-item">
              <div class="step-number">${recipe.steps.indexOf(step) + 1}</div>
              <div class="step-content">${step}</div>
            </li>
          `).join('')}
        </ol>
      </div>
      
      <div class="recipe-actions">
        ${recipe.youtubeUrl ? `
          <button class="btn btn-secondary" onclick="openYouTubeVideo('${recipe.youtubeUrl}', '${recipe.title.replace(/'/g, "\\'")}')">
            <i class="fab fa-youtube"></i>
            <span>Watch Video Tutorial</span>
          </button>
        ` : ''}
        <button class="btn btn-primary" onclick="printRecipe()">
          <i class="fas fa-print"></i>
          <span>Print Recipe</span>
        </button>
      </div>
    </div>
  `;
  
  // Animate recipe detail appearance
  const recipeDetail = container.querySelector('.recipe-detail');
  setTimeout(() => {
    recipeDetail.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    recipeDetail.style.opacity = '1';
    recipeDetail.style.transform = 'translateY(0)';
  }, 100);
  
  // Animate ingredients and steps
  setTimeout(() => {
    const items = container.querySelectorAll('.ingredient-item, .instruction-item');
    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      
      setTimeout(() => {
        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, index * 50);
    });
  }, 300);
  
  // Smooth scroll to recipe
  setTimeout(() => {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 500);
}

// Print recipe function
window.printRecipe = function() {
  const recipeDetail = document.querySelector('.recipe-detail');
  if (!recipeDetail) return;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Recipe</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .recipe-header { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
          .recipe-meta { display: flex; flex-wrap: wrap; gap: 15px; margin: 15px 0; }
          .meta-item { display: flex; align-items: center; gap: 5px; }
          .recipe-section { margin: 20px 0; }
          .recipe-section-title { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .ingredient-list, .instruction-list { padding-left: 20px; }
          .ingredient-item, .instruction-item { margin: 8px 0; }
          .instruction-item { display: flex; gap: 10px; }
          .step-number { font-weight: bold; min-width: 25px; }
          @media print {
            body { padding: 0; }
            .recipe-actions { display: none; }
          }
        </style>
      </head>
      <body>
        ${recipeDetail.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeYouTubeModal();
  }
});

// Add smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Performance optimization - Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimized scroll handler
const optimizedScrollHandler = debounce(setupParallaxEffect, 10);
window.addEventListener('scroll', optimizedScrollHandler);

// Add loading states to all buttons
document.querySelectorAll('.btn').forEach(btn => {
  if (!btn.querySelector('.btn-ripple')) {
    btn.innerHTML += '<div class="btn-ripple"></div>';
  }
});

console.log('🍳 Recipe Generator Enhanced JavaScript Loaded Successfully!');
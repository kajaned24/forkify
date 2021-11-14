'use strict';

const openRecipeForm = document.querySelector('.add-recipe');
const closeRecipeForm = document.querySelector('.close-pop-up');
const recipePopUp = document.querySelector('.overlay');
const searchRecipeButton = document.querySelector('.search-recipe-button');
const searchRecipeForm = document.querySelector('.search-recipe');
const recipePreviewContainer = document.querySelector('.recipe-preview');
const newRecipeInfo = document.querySelector('.add-recipe-form-info');
const newRecipeIngredients = document.querySelector(
  '.add-recipe-form-ingredients'
);
const addNewRecipeButton = document.querySelector('.add-recipe-button');
const recipeContainer = document.querySelector('.recipe');
const bookmarkButton = document.querySelector('.bookmark');
const bookmarkList = document.querySelector('.bookmarks');

let recipes = [],
  bookmarkElements = [],
  createdRecipes = [],
  currentElement;

class Recipe {
  constructor(
    title,
    publisher,
    servings,
    prepTime,
    image_url,
    recipe_id,
    ingredients
  ) {
    this.title = title;
    this.publisher = publisher;
    this.image_url = image_url;
    this.recipe_id = recipe_id;
    this.ingredients = ingredients;
    this.servings = servings;
    this.prepTime = prepTime;
  }
}

// Getting recipe data
async function getRecipeData(searchedRecipe) {
  try {
    const data = await fetch(
      `https://forkify-api.herokuapp.com/api/search?q=${searchedRecipe}`
    );
    if (!data.ok) throw new Error(`Couldn't get your data`);
    const dataResponse = await data.json();
    recipes = dataResponse.recipes;
  } catch (error) {
    recipePreviewContainer.insertAdjacentText('beforeend', error.message);
  }
}

// Displaying data based on user input
searchRecipeButton.addEventListener('click', function (e) {
  e.preventDefault();
  const searchedRecipe = searchRecipeForm.searchedRecipe.value;
  getRecipeData(searchedRecipe);
  setTimeout(() => {
    recipes.forEach(recipe => {
      renderRecipePreview(recipe);
    });
  }, 1000);
});

// Rendering searched recipes on recipe preview
function renderRecipePreview(recipe) {
  const recipePreview = `<div class="recipe-preview-element" data-id=${recipe.recipe_id}>
        <img src="${recipe.image_url}" alt="" />
        <div class="recipe-preview-description">
        <p class="recipe-name">${recipe.title}</p>
        <p class="recipe-preview-publisher">${recipe.publisher}</p>
        </div>
        <span class="remove-recipe-preview">X</span>
    </div>`;

  recipePreviewContainer.insertAdjacentHTML('beforeend', recipePreview);
}

function findCurrentElement(e) {
  currentElement = recipes.find(
    recipe => recipe.recipe_id === e.target.dataset.id
  );
}

recipePreviewContainer.addEventListener('click', function (e) {
  if (e.target.classList.contains('recipe-preview-element')) {
    findCurrentElement(e);
    renderRecipe(currentElement);
  }

  if (e.target.classList.contains('remove-recipe-preview')) {
    removeElement(createdRecipes, e);
    recipes.splice(currentRecipe, 1);
  }
});

// Pop-up to add new recipe
const hidePopUp = () => recipePopUp.classList.add('hidden');
const showPopUp = () => recipePopUp.classList.remove('hidden');

openRecipeForm.addEventListener('click', showPopUp);
closeRecipeForm.addEventListener('click', hidePopUp);

// Create recipe
function addNewRecipe() {
  const recipe = new Recipe(
    newRecipeInfo.title.value,
    newRecipeInfo.publisher.value,
    newRecipeInfo.servings.value,
    newRecipeInfo.prepTime.value,
    newRecipeInfo.url.value,
    `${new Date().getSeconds()}`,
    [
      newRecipeIngredients.ingredient1.value,
      newRecipeIngredients.ingredient2.value,
      newRecipeIngredients.ingredient3.value,
      newRecipeIngredients.ingredient4.value,
      newRecipeIngredients.ingredient5.value,
    ]
  );

  recipes.push(recipe);
  createdRecipes.push(recipe);

  renderRecipe(recipe);
  renderRecipePreview(recipe);
  setLocaleStorage();
}

// Rendering recipe
function renderRecipe(recipe) {
  const recipeBody = `
  <img src="${recipe.image_url}" alt="" class="recipe-img" />
  
      <div class="recipe-description">
        <p class="recipe-title">${recipe.title}</p>
        <div class="recipe-details" data-id='${recipe.recipe_id}'>
          <p class="prep-time">${recipe.prepTime || 30} minutes 🕗</p>
          <p class="servings">${recipe.prepTime || 3} servings🧑</p>
          <img class="bookmark" id="bookmark-png" src="img/bookmark.png" alt="">
        </div>
  
        <div class="ingredients">
          <h4 class="ingredient-title">Recipe Ingredients</h4>
          <ul class="ingredient-list">
           ${
             recipe.ingredients ||
             'Check out recipe ingredients on the link bellow'
           }

          </ul>
        </div>
  
        <div class="cook-it">
          <h4 class="cook-it-title">How to cook it</h4>
          <div class="cook-it-description">
            <p>
              The recipe was created by ${
                recipe.publisher
              } . You can see the recipe
              process <a href="http://">here</a>
            </p>
          </div>
        </div>
      </div>`;
  recipeContainer.innerHTML = recipeBody;
}
addNewRecipeButton.addEventListener('click', function () {
  addNewRecipe();
  clearInputs();
  hidePopUp();
});

function renderIngredients() {}

function clearInputs() {
  newRecipeInfo.title.value =
    newRecipeInfo.publisher.value =
    newRecipeInfo.servings.value =
    newRecipeInfo.prepTime.value =
    newRecipeInfo.url.value =
    newRecipeIngredients.ingredient1.value =
    newRecipeIngredients.ingredient2.value =
    newRecipeIngredients.ingredient3.value =
    newRecipeIngredients.ingredient4.value =
    newRecipeIngredients.ingredient5.value =
      '';
}

// Find and remove elements
let currentRecipe, currentRecipeId;
function findRecipe(e) {
  currentRecipeId = e.target.parentElement.dataset.id;
  currentRecipe = recipes.find(recipe => recipe.recipe_id === currentRecipeId);
}

function removeElement(array, e) {
  findRecipe(e);
  array.splice(currentRecipe, 1);
  e.target.parentElement.remove();
  setLocaleStorage();
}

// Handling bookmarks
recipeContainer.addEventListener('click', function (e) {
  if (e.target.classList.contains('bookmark')) {
    e.target.style.backgroundColor = 'lightpink';

    findRecipe(e);
    bookmarkElements.push(currentRecipe);
    renderBookmark(currentRecipe);
    setLocaleStorage();
  }
});

bookmarkButton.addEventListener('click', () => {
  bookmarkList.classList.toggle('hidden');
});

function renderBookmark(recipe) {
  const bookmarkElement = `
  <div class="bookmark-element" data-id='${recipe.recipe_id}'>
    <img src="${recipe.image_url}" alt="" />
    <div class="recipe-preview-description">
      <p class="recipe-title bookmark-title">${recipe.title}</p>
      <p class="recipe-preview-publisher">${recipe.publisher}</p>
    </div>
    <span class="remove-bookmark">X</span>
    </div>`;
  bookmarkList.insertAdjacentHTML('beforeend', bookmarkElement);
}

// Remove bookmark and display on click
bookmarkList.addEventListener('click', function (e) {
  if (e.target.classList.contains('remove-bookmark')) {
    removeElement(bookmarkElements, e);
  }

  if (e.target.classList.contains('bookmark-element')) {
    findCurrentElement(e);
    renderRecipe(currentElement);
  }
});

// Setting locale storage
function setLocaleStorage() {
  localStorage.setItem('bookmarks', JSON.stringify(bookmarkElements));
  localStorage.setItem('created-recipes', JSON.stringify(createdRecipes));
}

function getLocaleStorage() {
  const bookmarkData = JSON.parse(localStorage.getItem('bookmarks'));
  const createdRecipesData = JSON.parse(
    localStorage.getItem('created-recipes')
  );

  if (!bookmarkData) return;
  if (!createdRecipesData) return;

  bookmarkElements = bookmarkData;
  bookmarkElements.forEach(bookmark => {
    renderBookmark(bookmark);
    recipes.push(bookmark);
  });

  createdRecipes = createdRecipesData;
  createdRecipes.forEach(createdRecipe => {
    renderRecipePreview(createdRecipe);
    recipes.push(createdRecipe);
  });
}
getLocaleStorage();

// Pagination
// Render ingredients

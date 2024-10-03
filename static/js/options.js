// Utility function to open a modal by id
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
}

// Utility function to close a modal by id
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Event listener for closing modals by clicking outside
window.onclick = function(event) {
    const modals = ['recipeModal', 'activeRecipesModal', 'deleteModal', 'portionModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            closeModal(modalId);
        }
    });
}

// Modal functionality for adding recipe
const addRecipeBtn = document.getElementById('addRecipeBtn');
const closeAddRecipe = document.getElementById('recipeModal').getElementsByClassName('close')[0];

// Open modal for adding recipe
addRecipeBtn.onclick = function() {
    openModal('recipeModal');
}

// Close the modal for adding recipe
closeAddRecipe.onclick = function() {
    closeModal('recipeModal');
}

// Add new ingredient row functionality
document.getElementById('addIngredientBtn').addEventListener('click', function() {
    const ingredientsList = document.getElementById('ingredientsList');

    const newRow = document.createElement('div');
    newRow.classList.add('ingredient-row');

    newRow.innerHTML = `
        <input type="text" name="ingredient[]" placeholder="Ingredient" required>
        <input type="number" name="quantity[]" placeholder="Quantity" required>
        <select name="type[]">
            <option value="g">Grams</option>
            <option value="ml">Milliliters</option>
            <option value="tbsp">Tablespoons</option>
            <option value="tsp">Teaspoons</option>
            <option value="pcs">Pieces</option>
        </select>
        <button type="button" class="removeIngredientBtn">-</button>
    `;

    ingredientsList.appendChild(newRow);

    // Add remove functionality to the new row
    newRow.querySelector('.removeIngredientBtn').addEventListener('click', function() {
        newRow.remove();
    });
});

// Handle form submission (saving the recipe)
document.getElementById('recipeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);

    // Convert the data into JSON structure
    const recipe = {
        name: formData.get('recipeName'),
        ingredients: {}
    };

    formData.getAll('ingredient[]').forEach((ingredient, index) => {
        recipe.ingredients[ingredient] = {
            quantity: formData.getAll('quantity[]')[index],
            type: formData.getAll('type[]')[index]
        };
    });

    // Send the recipe data to the server
    fetch('/add-recipe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipe)
    }).then(response => {
        if (response.ok) {
            console.log('Recipe added successfully');
            closeModal('recipeModal'); // Close the modal on success
            event.target.reset(); // Clear form fields after submission
        } else {
            console.error('Failed to add recipe');
        }
    });
});

// Modal functionality for showing all recipes
const showActiveRecipesBtn = document.getElementById('showActiveRecipesBtn');
const closeActiveRecipesModal = document.getElementById('activeRecipesModal').getElementsByClassName('close')[0];

// Open modal for showing active recipes
showActiveRecipesBtn.onclick = function() {
    openModal('activeRecipesModal');

    // Fetch all recipes from the server (both active and inactive)
    fetch('/active-recipes')
        .then(response => response.json())
        .then(data => {
            const activeRecipeList = document.getElementById('activeRecipeList');
            activeRecipeList.innerHTML = ''; // Clear previous list items

            // Display each recipe and apply active/inactive styles
            data.forEach(recipe => {
                const li = document.createElement('li');
                li.textContent = recipe.name;
                li.classList.add(recipe.active ? 'active' : 'inactive');

                // Toggle active/inactive state on click
                li.onclick = function() {
                    const newActiveState = !recipe.active;
                    recipe.active = newActiveState;

                    li.classList.toggle('active', newActiveState);
                    li.classList.toggle('inactive', !newActiveState);

                    // Update active state on the server
                    fetch('/update-recipe-status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ recipe_name: recipe.name, active: newActiveState })
                    }).then(response => {
                        if (!response.ok) {
                            console.error('Failed to update recipe status');
                        }
                    });
                };

                activeRecipeList.appendChild(li);
            });
        });
}

// Close active recipes modal
closeActiveRecipesModal.onclick = function() {
    closeModal('activeRecipesModal');
}

// Modal functionality for deleting recipe
const deleteRecipeBtn = document.getElementById('deleteRecipeBtn');
const closeDeleteRecipeModal = document.getElementById('deleteModal').getElementsByClassName('close')[0];
const confirmDeleteBtn = document.getElementById('confirmDelete');

// Open modal for deleting recipe
deleteRecipeBtn.onclick = function() {
    openModal('deleteModal');

    // Fetch recipes from the server to populate the delete modal
    fetch('/recipes')
        .then(response => response.json())
        .then(data => {
            const recipeList = document.getElementById('recipeList');
            recipeList.innerHTML = ''; // Clear any previous list items

            data.forEach(recipe => {
                const li = document.createElement('li');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('recipe-checkbox');

                const label = document.createElement('label');
                label.textContent = recipe;

                li.appendChild(checkbox);
                li.appendChild(label);
                recipeList.appendChild(li);
            });
        });
}

// Close delete recipe modal
closeDeleteRecipeModal.onclick = function() {
    closeModal('deleteModal');
}

// Confirm delete selected recipes
confirmDeleteBtn.onclick = function() {
    const selectedRecipes = Array.from(document.querySelectorAll('.recipe-checkbox:checked'))
        .map(checkbox => checkbox.nextSibling.textContent);

    if (selectedRecipes.length > 0) {
        // Send delete request for all selected recipes
        fetch('/delete-recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipe_names: selectedRecipes })
        }).then(response => {
            if (response.ok) {
                console.log('Recipes deleted successfully');
                closeModal('deleteModal'); // Close the modal
                selectedRecipes.forEach(recipe => {
                    const listItem = Array.from(document.getElementById('recipeList').children)
                        .find(li => li.textContent.trim() === recipe);
                    if (listItem) listItem.remove();
                });
            } else {
                console.error('Failed to delete recipes');
            }
        });
    } else {
        alert('Please select recipes to delete');
    }
}

// Modal for setting portions
const setPortionsBtn = document.getElementById('setPortionsBtn');
const portionSlider = document.getElementById('portionSlider');
const portionCount = document.getElementById('portionCount');
const savePortionsBtn = document.getElementById('savePortionsBtn');

// Open modal for setting portions
setPortionsBtn.onclick = function() {
    openModal('portionModal');
}

// Update displayed portion count when slider is moved
portionSlider.oninput = function() {
    portionCount.innerText = this.value;
}

// Save the selected portion value
savePortionsBtn.onclick = function() {
    const selectedPortions = portionSlider.value;
    alert('Number of portions: ' + selectedPortions);
    closeModal('portionModal');
}

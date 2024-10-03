// Modal functionality for adding recipe
const addRecipeModal = document.getElementById('recipeModal');
const addRecipeBtn = document.getElementById('addRecipeBtn');
const closeAddRecipe = addRecipeModal.getElementsByClassName('close')[0];

// Open the modal for adding recipe
addRecipeBtn.onclick = function() {
    addRecipeModal.style.display = 'block';
}

// Close the modal for adding recipe
closeAddRecipe.onclick = function() {
    addRecipeModal.style.display = 'none';
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target === addRecipeModal) {
        addRecipeModal.style.display = 'none';
    }
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
            addRecipeModal.style.display = 'none'; // Close the modal on success
            event.target.reset(); // Clear form fields after submission
        } else {
            console.error('Failed to add recipe');
        }
    });
});

// Modal functionality for showing all recipes with active/inactive distinction
const showActiveRecipesBtn = document.getElementById('showActiveRecipesBtn');
const activeRecipesModal = document.getElementById('activeRecipesModal');
const closeActiveRecipesModal = activeRecipesModal.getElementsByClassName('close')[0];
const activeRecipeList = document.getElementById('activeRecipeList');

// Open the modal for showing all recipes (active and inactive)
showActiveRecipesBtn.onclick = function() {
    activeRecipesModal.style.display = 'block';

    // Fetch all recipes from the server (both active and inactive)
    fetch('/active-recipes')
        .then(response => response.json())
        .then(data => {
            activeRecipeList.innerHTML = ''; // Clear previous list items

            // Display each recipe and apply active/inactive styles
            data.forEach(recipe => {
                const li = document.createElement('li');
                li.textContent = recipe.name; // Show the name of the recipe
                li.classList.add(recipe.active ? 'active' : 'inactive'); // Add classes for styling

                // Toggle active/inactive state on click
                li.onclick = function() {
                    const newActiveState = !recipe.active; // Toggle state
                    recipe.active = newActiveState;  // Update the state in the local object

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

                activeRecipeList.appendChild(li);  // Add the recipe to the list
            });
        });
};

// Close the active recipes modal
closeActiveRecipesModal.onclick = function() {
    activeRecipesModal.style.display = 'none';
};

// Close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target === activeRecipesModal) {
        activeRecipesModal.style.display = 'none';
    }
};


// Modal functionality for deleting recipe
const deleteRecipeModal = document.getElementById('deleteModal');
const deleteRecipeBtn = document.getElementById('deleteRecipeBtn');
const closeDeleteRecipeModal = deleteRecipeModal.getElementsByClassName('close')[0];
const recipeList = document.getElementById('recipeList');
const confirmDeleteBtn = document.getElementById('confirmDelete');

// Open the modal for deleting recipe
deleteRecipeBtn.onclick = function() {
    deleteRecipeModal.style.display = 'block';

    // Fetch recipes from the server to populate the delete modal
    fetch('/recipes')
        .then(response => response.json())
        .then(data => {
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


// Close the modal for deleting recipe
closeDeleteRecipeModal.onclick = function() {
    deleteRecipeModal.style.display = 'none';
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target === deleteRecipeModal) {
        deleteRecipeModal.style.display = 'none';
    }
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
                deleteRecipeModal.style.display = 'none'; // Close the modal
                selectedRecipes.forEach(recipe => {
                    const listItem = Array.from(recipeList.children).find(li => li.textContent.trim() === recipe);
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


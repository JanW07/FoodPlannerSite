// Modal functionality for adding recipe
const addRecipeModal = document.getElementById('recipeModal');
const addRecipeBtn = document.getElementById('addRecipeBtn');
const closeAddRecipe = document.getElementsByClassName('close')[0];

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
    if (event.target == addRecipeModal) {
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

// Remove ingredient row functionality
document.querySelectorAll('.removeIngredientBtn').forEach(button => {
    button.addEventListener('click', function() {
        this.parentElement.remove();
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
            addRecipeModal.style.display = 'none';
        } else {
            console.error('Failed to add recipe');
        }
    });

    // Clear form fields
    event.target.reset();
});


// Modal functionality for deleting recipe
const deleteRecipeModal = document.getElementById('deleteModal');
const deleteRecipeBtn = document.getElementById('deleteRecipeBtn');
const closeDeleteRecipe = document.getElementsByClassName('close')[1];
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
                li.textContent = recipe;
                li.onclick = function() {
                    li.classList.toggle('selected'); // Toggle selection
                };
                recipeList.appendChild(li);
            });
        });
}

// Close the modal for deleting recipe
closeDeleteRecipe.onclick = function() {
    deleteRecipeModal.style.display = 'none';
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == deleteRecipeModal) {
        deleteRecipeModal.style.display = 'none';
    }
}

// Confirm delete selected recipe
confirmDeleteBtn.onclick = function() {
    const selectedRecipe = document.querySelector('.selected');

    if (selectedRecipe) {
        const recipeName = selectedRecipe.textContent;

        // Send delete request to the server
        fetch('/delete-recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipe_name: recipeName })
        }).then(response => {
            if (response.ok) {
                console.log('Recipe deleted successfully');
                deleteRecipeModal.style.display = 'none'; // Close the modal
                selectedRecipe.remove(); // Remove from the list
            } else {
                console.error('Failed to delete recipe');
            }
        });
    } else {
        alert('Please select a recipe to delete');
    }
}

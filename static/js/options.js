// Modal functionality
const modal = document.getElementById('recipeModal');
const addRecipeBtn = document.getElementById('addRecipeBtn');
const span = document.getElementsByClassName('close')[0];

// Open the modal
addRecipeBtn.onclick = function() {
    modal.style.display = 'block';
}

// Close the modal
span.onclick = function() {
    modal.style.display = 'none';
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
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
            modal.style.display = 'none';
        } else {
            console.error('Failed to add recipe');
        }
    });

    // Clear form fields
    event.target.reset();
});

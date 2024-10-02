document.getElementById('generate-btn').addEventListener('click', async (event) => {
    event.preventDefault();  // Prevent default action if inside a form

    const response = await fetch('/generate');
    const data = await response.json();

    // Clear previous recipes display (you may need to add a div for displaying these)
    const recipesDiv = document.getElementById('recipes');
    recipesDiv.innerHTML = '';

    // Display generated recipes
    data.recipes.forEach(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.textContent = recipe.name;
        recipesDiv.appendChild(recipeDiv);
    });

    // Populate shopping list table
    const shoppingListTable = document.getElementById('shopping-list');
    const tbody = shoppingListTable.querySelector('tbody');
    tbody.innerHTML = ''; // Clear previous entries

    for (const [item, details] of Object.entries(data.shopping_list)) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item}</td><td>${details.quantity}</td><td>${details.type}</td>`;
        tbody.appendChild(tr);
    }

    // Show the shopping list table
    shoppingListTable.style.display = 'table';
    document.getElementById('download-btn').style.display = 'block';
});

// Optionally, you can add listeners for the other buttons
document.getElementById('list-btn').addEventListener('click', () => {
    window.location.href = '/list';  // Redirect to list page
});

document.getElementById('calendar-btn').addEventListener('click', () => {
    window.location.href = '/calendar';  // Redirect to calendar page
});

document.getElementById('options-btn').addEventListener('click', () => {
    window.location.href = '/options';  // Redirect to options page
});

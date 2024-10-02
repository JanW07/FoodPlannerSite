document.getElementById('generate-btn').addEventListener('click', async (event) => {
    event.preventDefault();  // Prevent default action if inside a form

    const response = await fetch('/generate');
    const data = await response.json();

    // Clear previous recipes display
    const recipesDiv = document.getElementById('recipes');
    recipesDiv.innerHTML = '';

    /*// Display generated recipes
    data.recipes.forEach(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.textContent = recipe.name;
        recipesDiv.appendChild(recipeDiv);
    });*/
});
document.getElementById('list-btn').addEventListener('click', () => {
    window.location.href = '/list';
});

document.getElementById('calendar-btn').addEventListener('click', () => {
    window.location.href = '/calendar';
});

document.getElementById('options-btn').addEventListener('click', () => {
    window.location.href = '/options';
});

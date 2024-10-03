async function fetchMealsPlan() {
    try {
        const response = await fetch('/meals-plan');
        const data = await response.json();

        if (response.ok) {
            const mealsTableBody = document.getElementById('meals-table-body');
            
            mealsTableBody.innerHTML = ''; // Clear existing rows

            // Populate days and meals
            Object.keys(data.meals_plan).forEach(day => {
                const meal = data.meals_plan[day];

                // Create a new row for each day-meal pair
                const mealRow = document.createElement('tr');

                // Add day cell
                const dayTd = document.createElement('td');
                dayTd.textContent = day;
                mealRow.appendChild(dayTd);

                // Add meal cell
                const mealTd = document.createElement('td');
                mealTd.textContent = meal;
                mealRow.appendChild(mealTd);

                // Append the meal row to the table body
                mealsTableBody.appendChild(mealRow);
            });
        } else {
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error fetching meals plan:', error);
    }
}

window.onload = fetchMealsPlan;

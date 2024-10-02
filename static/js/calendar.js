async function fetchMealsPlan() {
    try {
        const response = await fetch('/meals-plan');
        const data = await response.json();

        if (response.ok) {
            const daysRow = document.getElementById('days-row');
            const mealsRow = document.getElementById('meals-row');
            
            daysRow.innerHTML = ''; // Clear existing columns
            mealsRow.innerHTML = ''; // Clear existing columns

            // Populate days and meals
            Object.keys(data.meals_plan).forEach(day => {
                const meal = data.meals_plan[day];

                // Add day to the header
                const dayTh = document.createElement('th');
                dayTh.textContent = day;
                daysRow.appendChild(dayTh);

                // Add meal to the meals row
                const mealTd = document.createElement('td');
                mealTd.textContent = meal;
                mealsRow.appendChild(mealTd);
            });
        } else {
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error fetching meals plan:', error);
    }
}

window.onload = fetchMealsPlan;

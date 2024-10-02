async function fetchShoppingList() {
    try {
        const response = await fetch('/shopping-list');
        const data = await response.json(); // Changed to 'data' to capture the whole response

        if (response.ok) {
            const shoppingList = data.shopping_list; // Access the 'shopping_list' from the response

            const tbody = document.getElementById('shopping-list-body');
            tbody.innerHTML = ''; // Clear previous entries

            for (const [item, details] of Object.entries(shoppingList)) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${item}</td><td>${details.quantity}</td><td>${details.type}</td>`;
                tbody.appendChild(tr);
            }
        } else {
            console.error('Error fetching shopping list:', data.error); // Updated to access 'data.error'
        }
    } catch (error) {
        console.error('Error fetching shopping list:', error);
    }
}

window.onload = fetchShoppingList;

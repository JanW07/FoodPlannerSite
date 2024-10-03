from flask import Flask, render_template, request, jsonify, send_file
import json
import random
import os

app = Flask(__name__)

# Path to the recipes.json file
RECIPES_FILE_PATH = 'data/recipes.json'

# Load recipes from JSON
def load_recipes():
    with open(RECIPES_FILE_PATH, 'r') as f:
        data = json.load(f)
    return data['recipes']

# Save recipes to JSON
def save_recipes(recipes):
    with open(RECIPES_FILE_PATH, 'w') as f:
        json.dump({'recipes': recipes}, f, indent=4)

# Assign random recipes for the week
def assign_recipes(recipes):
    # Filter active recipes
    active_recipes = [recipe for recipe in recipes if recipe['active']]
    random.shuffle(active_recipes)
    return active_recipes[:7]  # Return 7 random active recipes for 7 days

# Generate shopping list
def generate_shopping_list(assigned_recipes):
    shopping_list = {}
    for recipe in assigned_recipes:
        for item, details in recipe['ingredients'].items():
            quantity = details['quantity']
            type_of_amount = details['type']
            if item in shopping_list:
                shopping_list[item]['quantity'] += quantity
            else:
                shopping_list[item] = {'quantity': quantity, 'type': type_of_amount}
    return shopping_list

# Write shopping list to a JSON file
def write_shopping_list_to_file(shopping_list):
    output_path = 'output/shopping_list.json'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(shopping_list, f, indent=4)

# Write meals plan to a JSON file
def write_meals_to_file(assigned_recipes):
    output_path = 'output/meals_plan.json'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    meals_plan = {}
    days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    for i, recipe in enumerate(assigned_recipes):
        meals_plan[days_of_week[i]] = recipe['name']
    
    with open(output_path, 'w') as f:
        json.dump(meals_plan, f, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['GET'])
def generate():
    recipes = load_recipes()
    assigned_recipes = assign_recipes(recipes)
    shopping_list = generate_shopping_list(assigned_recipes)
    
    write_shopping_list_to_file(shopping_list)
    write_meals_to_file(assigned_recipes)

    return jsonify({
        "recipes": assigned_recipes,
        "shopping_list": shopping_list
    })

@app.route('/download')
def download():
    return send_file('output/shopping_list.json', as_attachment=True)  # Corrected to match JSON format

@app.route('/list')
def list_view():
    return render_template('list.html')

@app.route('/calendar')
def calendar_view():
    return render_template('calendar.html')

@app.route('/options')
def options_view():
    return render_template('options.html')

# New route to read and serve shopping list from JSON
@app.route('/shopping-list', methods=['GET'])
def get_shopping_list():
    try:
        with open('output/shopping_list.json', 'r') as f:
            data = json.load(f)
        return jsonify({'shopping_list': data})
    except FileNotFoundError:
        return jsonify({'error': 'Shopping list not found.'}), 404

# New route to serve meals plan from JSON
@app.route('/meals-plan', methods=['GET'])
def get_meals_plan():
    try:
        with open('output/meals_plan.json', 'r') as f:
            data = json.load(f)
        return jsonify({'meals_plan': data})
    except FileNotFoundError:
        return jsonify({'error': 'Meals plan not found.'}), 404

# Route to fetch all recipes (for the delete modal)
@app.route('/recipes', methods=['GET'])
def get_recipes():
    recipes = load_recipes()
    recipe_names = [recipe['name'] for recipe in recipes]
    return jsonify(recipe_names), 200

# Adjusted route to get only active recipes
@app.route('/active-recipes', methods=['GET'])
def active_recipes():
    recipes = load_recipes()
    # Return all recipes (both active and inactive)
    return jsonify(recipes)

@app.route('/add-recipe', methods=['POST'])
def add_recipe():
    new_recipe = request.json
    recipes = load_recipes()
    new_recipe['active'] = True  # Set new recipe as active by default
    recipes.append(new_recipe)  # Append the new recipe
    save_recipes(recipes)
    return jsonify(success=True)

@app.route('/update-recipe-status', methods=['POST'])
def update_recipe_status():
    data = request.json
    recipes = load_recipes()
    for recipe in recipes:
        if recipe['name'] == data['recipe_name']:
            recipe['active'] = data['active']  # Update active status
            save_recipes(recipes)
            return jsonify(success=True)
    return jsonify(success=False), 404  # Return error if recipe not found

@app.route('/delete-recipes', methods=['POST'])
def delete_recipes():
    data = request.json
    recipes_to_delete = data.get('recipe_names', [])  # Get the list of recipe names to delete

    if not recipes_to_delete:
        return jsonify(success=False, message="No recipes selected for deletion"), 400

    # Load existing recipes
    recipes = load_recipes()

    # Filter out the recipes that should be deleted
    recipes = [recipe for recipe in recipes if recipe['name'] not in recipes_to_delete]

    # Save the updated recipe list
    save_recipes(recipes)

    return jsonify(success=True, message="Recipes deleted successfully")

if __name__ == '__main__':
    app.run(debug=True)

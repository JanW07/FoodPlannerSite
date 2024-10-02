from flask import Flask, render_template, jsonify, send_file
import json
import random
import os

app = Flask(__name__)

# Load recipes from JSON
def load_recipes():
    with open('data/recipes.json', 'r') as f:
        data = json.load(f)
    return data['recipes']

# Assign random recipes for the week
def assign_recipes(recipes):
    random.shuffle(recipes)
    return recipes[:7]  # Return 7 random recipes for 7 days

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
        json.dump(shopping_list, f)

# Write meals plan to a JSON file
def write_meals_to_file(assigned_recipes):
    output_path = 'output/meals_plan.json'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    meals_plan = [recipe['name'] for recipe in assigned_recipes]
    with open(output_path, 'w') as f:
        json.dump(meals_plan, f)

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
    return send_file('output/shopping_list.txt', as_attachment=True)

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

# New route to read and serve meals plan from JSON
@app.route('/meals-plan', methods=['GET'])
def get_meals_plan():
    try:
        with open('output/meals_plan.json', 'r') as f:
            data = json.load(f)
        return jsonify({'meals_plan': data})
    except FileNotFoundError:
        return jsonify({'error': 'Meals plan not found.'}), 404


if __name__ == '__main__':
    app.run(debug=True)

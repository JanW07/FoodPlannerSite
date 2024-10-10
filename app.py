from flask import Flask, render_template, request, jsonify, send_file
import os
import json  # Add this import
from generation import (
    load_recipes, save_recipes, assign_recipes, generate_shopping_list,
    write_shopping_list_to_file, write_meals_to_file
)

app = Flask(__name__)

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
    return send_file('output/shopping_list.json', as_attachment=True)

@app.route('/list')
def list_view():
    return render_template('list.html')

@app.route('/calendar')
def calendar_view():
    return render_template('calendar.html')

@app.route('/options')
def options_view():
    return render_template('options.html')

@app.route('/shopping-list', methods=['GET'])
def get_shopping_list():
    try:
        with open('output/shopping_list.json', 'r') as f:
            data = json.load(f)
        return jsonify({'shopping_list': data})
    except FileNotFoundError:
        return jsonify({'error': 'Shopping list not found.'}), 404

@app.route('/meals-plan', methods=['GET'])
def get_meals_plan():
    try:
        with open('output/meals_plan.json', 'r') as f:
            data = json.load(f)
        return jsonify({'meals_plan': data})
    except FileNotFoundError:
        return jsonify({'error': 'Meals plan not found.'}), 404

@app.route('/recipes', methods=['GET'])
def get_recipes():
    recipes = load_recipes()
    recipe_names = [recipe['name'] for recipe in recipes]
    return jsonify(recipe_names), 200

@app.route('/active-recipes', methods=['GET'])
def active_recipes():
    recipes = load_recipes()
    return jsonify(recipes)

@app.route('/add-recipe', methods=['POST'])
def add_recipe():
    new_recipe = request.json
    recipes = load_recipes()
    new_recipe['active'] = True
    recipes.append(new_recipe)
    save_recipes(recipes)
    return jsonify(success=True)

@app.route('/update-recipe-status', methods=['POST'])
def update_recipe_status():
    data = request.json
    recipes = load_recipes()
    for recipe in recipes:
        if recipe['name'] == data['recipe_name']:
            recipe['active'] = data['active']
            save_recipes(recipes)
            return jsonify(success=True)
    return jsonify(success=False), 404

@app.route('/delete-recipes', methods=['POST'])
def delete_recipes():
    data = request.json
    recipes_to_delete = data.get('recipe_names', [])

    if not recipes_to_delete:
        return jsonify(success=False, message="No recipes selected for deletion"), 400

    recipes = load_recipes()
    recipes = [recipe for recipe in recipes if recipe['name'] not in recipes_to_delete]
    save_recipes(recipes)

    return jsonify(success=True, message="Recipes deleted successfully")

if __name__ == '__main__':
    app.run(debug=True)
    
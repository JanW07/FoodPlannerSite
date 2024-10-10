# generation.py
import json
import os
import random

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

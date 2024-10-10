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

# Assign random recipes for the week with portion control
def assign_recipes(recipes):
    active_recipes = [recipe for recipe in recipes if recipe['active']]
    random.shuffle(active_recipes)

    assigned_recipes = []
    day_index = 0

    # Assign recipes for the first 6 days
    while day_index < 6:
        if not active_recipes:
            break
        recipe = active_recipes.pop(0)

        if recipe['number_of_portions'] == 4:
            # Assign for the current day and the next day
            if day_index < 5:  # Ensure we don't exceed the day limit
                assigned_recipes.append(recipe)
                assigned_recipes.append(recipe)
                day_index += 2
        else:
            # Assign for one day
            assigned_recipes.append(recipe)
            day_index += 1

    # Assign a 2-portion meal for the last day
    last_day_recipe = next((r for r in active_recipes if r['number_of_portions'] == 2), None)
    if last_day_recipe:
        assigned_recipes.append(last_day_recipe)
    else:
        # If no 2-portion meals left, pick any random recipe with 2 portions
        assigned_recipes.append(random.choice([r for r in recipes if r['number_of_portions'] == 2]))

    return assigned_recipes

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

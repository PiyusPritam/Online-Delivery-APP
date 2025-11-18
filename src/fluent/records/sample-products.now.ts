import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

// FRUITS
export const apple_product = Record({
    $id: Now.ID['apple_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Fresh Red Apples',
        description: 'Crisp and sweet red apples, perfect for snacking or baking',
        category: 'fruits',
        price: 2.99,
        unit: 'pound',
        stock_quantity: 50,
        active: true,
        delivery_time_hours: 2
    }
})

export const banana_product = Record({
    $id: Now.ID['banana_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Organic Bananas',
        description: 'Yellow organic bananas, great source of potassium and natural energy',
        category: 'fruits',
        price: 1.89,
        unit: 'pound',
        stock_quantity: 75,
        active: true,
        delivery_time_hours: 2
    }
})

export const strawberry_product = Record({
    $id: Now.ID['strawberry_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Fresh Strawberries',
        description: 'Sweet, juicy strawberries perfect for desserts and snacking',
        category: 'fruits',
        price: 4.99,
        unit: 'piece',
        stock_quantity: 35,
        active: true,
        delivery_time_hours: 2
    }
})

export const orange_product = Record({
    $id: Now.ID['orange_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Naval Oranges',
        description: 'Sweet and seedless naval oranges, rich in vitamin C',
        category: 'fruits',
        price: 3.49,
        unit: 'pound',
        stock_quantity: 45,
        active: true,
        delivery_time_hours: 2
    }
})

export const grapes_product = Record({
    $id: Now.ID['grapes_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Red Grapes',
        description: 'Sweet red grapes, perfect for snacking or wine making',
        category: 'fruits',
        price: 3.99,
        unit: 'pound',
        stock_quantity: 28,
        active: true,
        delivery_time_hours: 2
    }
})

// VEGETABLES
export const tomato_product = Record({
    $id: Now.ID['tomato_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Roma Tomatoes',
        description: 'Fresh roma tomatoes, perfect for cooking and salads',
        category: 'vegetables',
        price: 2.49,
        unit: 'pound',
        stock_quantity: 40,
        active: true,
        delivery_time_hours: 2
    }
})

export const spinach_product = Record({
    $id: Now.ID['spinach_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Baby Spinach',
        description: 'Tender baby spinach leaves, great for salads and smoothies',
        category: 'vegetables',
        price: 3.99,
        unit: 'piece',
        stock_quantity: 20,
        active: true,
        delivery_time_hours: 2
    }
})

export const carrots_product = Record({
    $id: Now.ID['carrots_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Fresh Carrots',
        description: 'Crunchy organic carrots, high in beta-carotene',
        category: 'vegetables',
        price: 1.99,
        unit: 'pound',
        stock_quantity: 55,
        active: true,
        delivery_time_hours: 2
    }
})

export const broccoli_product = Record({
    $id: Now.ID['broccoli_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Fresh Broccoli',
        description: 'Green broccoli crowns, packed with vitamins and fiber',
        category: 'vegetables',
        price: 2.79,
        unit: 'piece',
        stock_quantity: 32,
        active: true,
        delivery_time_hours: 2
    }
})

export const lettuce_product = Record({
    $id: Now.ID['lettuce_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Iceberg Lettuce',
        description: 'Crisp iceberg lettuce, perfect for salads and sandwiches',
        category: 'vegetables',
        price: 1.49,
        unit: 'piece',
        stock_quantity: 25,
        active: true,
        delivery_time_hours: 2
    }
})

// DAIRY
export const milk_product = Record({
    $id: Now.ID['milk_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Whole Milk',
        description: 'Fresh whole milk from local dairy farms, rich and creamy',
        category: 'dairy',
        price: 4.29,
        unit: 'gallon',
        stock_quantity: 30,
        active: true,
        delivery_time_hours: 1
    }
})

export const cheese_product = Record({
    $id: Now.ID['cheese_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Cheddar Cheese',
        description: 'Sharp aged cheddar cheese, perfect for sandwiches and cooking',
        category: 'dairy',
        price: 5.99,
        unit: 'piece',
        stock_quantity: 22,
        active: true,
        delivery_time_hours: 1
    }
})

export const yogurt_product = Record({
    $id: Now.ID['yogurt_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Greek Yogurt',
        description: 'Thick and creamy Greek yogurt, high in protein',
        category: 'dairy',
        price: 6.49,
        unit: 'piece',
        stock_quantity: 18,
        active: true,
        delivery_time_hours: 1
    }
})

export const butter_product = Record({
    $id: Now.ID['butter_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Unsalted Butter',
        description: 'Premium unsalted butter, perfect for baking and cooking',
        category: 'dairy',
        price: 4.79,
        unit: 'piece',
        stock_quantity: 26,
        active: true,
        delivery_time_hours: 1
    }
})

// MEAT & SEAFOOD
export const chicken_product = Record({
    $id: Now.ID['chicken_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Chicken Breast',
        description: 'Fresh boneless, skinless chicken breast, lean and tender',
        category: 'meat',
        price: 8.99,
        unit: 'pound',
        stock_quantity: 15,
        active: true,
        delivery_time_hours: 1
    }
})

export const beef_product = Record({
    $id: Now.ID['beef_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Ground Beef',
        description: '80/20 ground beef, perfect for burgers and tacos',
        category: 'meat',
        price: 7.99,
        unit: 'pound',
        stock_quantity: 12,
        active: true,
        delivery_time_hours: 1
    }
})

export const salmon_product = Record({
    $id: Now.ID['salmon_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Atlantic Salmon',
        description: 'Fresh Atlantic salmon fillets, rich in omega-3',
        category: 'meat',
        price: 12.99,
        unit: 'pound',
        stock_quantity: 8,
        active: true,
        delivery_time_hours: 1
    }
})

// GROCERIES
export const bread_product = Record({
    $id: Now.ID['bread_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread, rich in fiber',
        category: 'groceries',
        price: 3.49,
        unit: 'piece',
        stock_quantity: 25,
        active: true,
        delivery_time_hours: 3
    }
})

export const rice_product = Record({
    $id: Now.ID['rice_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Jasmine Rice',
        description: 'Premium jasmine rice, perfect for Asian dishes',
        category: 'groceries',
        price: 4.99,
        unit: 'piece',
        stock_quantity: 40,
        active: true,
        delivery_time_hours: 3
    }
})

export const pasta_product = Record({
    $id: Now.ID['pasta_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Spaghetti Pasta',
        description: 'Classic Italian spaghetti pasta made from durum wheat',
        category: 'groceries',
        price: 2.99,
        unit: 'piece',
        stock_quantity: 35,
        active: true,
        delivery_time_hours: 3
    }
})

export const cereal_product = Record({
    $id: Now.ID['cereal_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Honey Nut Cereal',
        description: 'Crunchy honey nut cereal, fortified with vitamins',
        category: 'groceries',
        price: 5.49,
        unit: 'piece',
        stock_quantity: 28,
        active: true,
        delivery_time_hours: 3
    }
})

// BEVERAGES
export const juice_product = Record({
    $id: Now.ID['juice_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Orange Juice',
        description: 'Freshly squeezed orange juice, no pulp, vitamin C enriched',
        category: 'beverages',
        price: 5.99,
        unit: 'piece',
        stock_quantity: 35,
        active: true,
        delivery_time_hours: 2
    }
})

export const coffee_product = Record({
    $id: Now.ID['coffee_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Premium Coffee Beans',
        description: 'Arabica coffee beans, medium roast, rich flavor',
        category: 'beverages',
        price: 12.99,
        unit: 'piece',
        stock_quantity: 20,
        active: true,
        delivery_time_hours: 2
    }
})

export const soda_product = Record({
    $id: Now.ID['soda_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Cola Soft Drink',
        description: 'Classic cola soft drink, 12-pack cans',
        category: 'beverages',
        price: 6.99,
        unit: 'piece',
        stock_quantity: 42,
        active: true,
        delivery_time_hours: 2
    }
})

export const water_product = Record({
    $id: Now.ID['water_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Spring Water',
        description: 'Pure spring water, 24-pack bottles',
        category: 'beverages',
        price: 4.99,
        unit: 'piece',
        stock_quantity: 50,
        active: true,
        delivery_time_hours: 2
    }
})

// HOUSEHOLD ITEMS
export const detergent_product = Record({
    $id: Now.ID['detergent_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Laundry Detergent',
        description: 'High-efficiency laundry detergent, fresh scent, 64 loads',
        category: 'household',
        price: 12.99,
        unit: 'piece',
        stock_quantity: 18,
        active: true,
        delivery_time_hours: 4
    }
})

export const paper_towels_product = Record({
    $id: Now.ID['paper_towels_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Paper Towels',
        description: 'Ultra-absorbent paper towels, 8-pack rolls',
        category: 'household',
        price: 8.99,
        unit: 'piece',
        stock_quantity: 24,
        active: true,
        delivery_time_hours: 4
    }
})

export const dish_soap_product = Record({
    $id: Now.ID['dish_soap_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Dish Soap',
        description: 'Grease-cutting dish soap, lemon scent',
        category: 'household',
        price: 3.49,
        unit: 'piece',
        stock_quantity: 32,
        active: true,
        delivery_time_hours: 4
    }
})

export const toilet_paper_product = Record({
    $id: Now.ID['toilet_paper_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Toilet Paper',
        description: 'Ultra-soft toilet paper, 12-pack double rolls',
        category: 'household',
        price: 11.99,
        unit: 'piece',
        stock_quantity: 16,
        active: true,
        delivery_time_hours: 4
    }
})

// PERSONAL CARE
export const shampoo_product = Record({
    $id: Now.ID['shampoo_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Natural Shampoo',
        description: 'Sulfate-free natural shampoo for all hair types, moisturizing',
        category: 'personal_care',
        price: 8.49,
        unit: 'piece',
        stock_quantity: 22,
        active: true,
        delivery_time_hours: 3
    }
})

export const toothpaste_product = Record({
    $id: Now.ID['toothpaste_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Whitening Toothpaste',
        description: 'Fluoride toothpaste with whitening action, mint flavor',
        category: 'personal_care',
        price: 4.99,
        unit: 'piece',
        stock_quantity: 38,
        active: true,
        delivery_time_hours: 3
    }
})

export const deodorant_product = Record({
    $id: Now.ID['deodorant_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Antiperspirant Deodorant',
        description: '24-hour protection antiperspirant deodorant, fresh scent',
        category: 'personal_care',
        price: 5.49,
        unit: 'piece',
        stock_quantity: 26,
        active: true,
        delivery_time_hours: 3
    }
})

export const body_wash_product = Record({
    $id: Now.ID['body_wash_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Moisturizing Body Wash',
        description: 'Gentle moisturizing body wash with aloe vera',
        category: 'personal_care',
        price: 6.99,
        unit: 'piece',
        stock_quantity: 19,
        active: true,
        delivery_time_hours: 3
    }
})
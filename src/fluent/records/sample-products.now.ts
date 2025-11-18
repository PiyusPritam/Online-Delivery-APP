import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

// FRUITS
export const mango_product = Record({
    $id: Now.ID['mango_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Alphonso Mangoes',
        description: 'Premium Alphonso mangoes from Ratnagiri, sweet and juicy',
        category: 'fruits',
        price: 120,
        unit: 'kg',
        stock_quantity: 50,
        active: true,
        delivery_time_hours: 2
    }
})

export const banana_product = Record({
    $id: Now.ID['banana_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Robusta Bananas',
        description: 'Fresh robusta bananas from Kerala, rich in potassium',
        category: 'fruits',
        price: 40,
        unit: 'dozen',
        stock_quantity: 75,
        active: true,
        delivery_time_hours: 2
    }
})

export const pomegranate_product = Record({
    $id: Now.ID['pomegranate_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Maharashtra Pomegranates',
        description: 'Fresh pomegranates packed with antioxidants, ruby red arils',
        category: 'fruits',
        price: 180,
        unit: 'kg',
        stock_quantity: 35,
        active: true,
        delivery_time_hours: 2
    }
})

export const orange_product = Record({
    $id: Now.ID['orange_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Nagpur Oranges',
        description: 'Sweet Nagpur oranges, rich in vitamin C, winter special',
        category: 'fruits',
        price: 60,
        unit: 'kg',
        stock_quantity: 45,
        active: true,
        delivery_time_hours: 2
    }
})

export const grapes_product = Record({
    $id: Now.ID['grapes_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Nashik Green Grapes',
        description: 'Sweet seedless green grapes from Nashik vineyards',
        category: 'fruits',
        price: 80,
        unit: 'kg',
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
        name: 'Fresh Tomatoes',
        description: 'Fresh red tomatoes, perfect for curries and salads',
        category: 'vegetables',
        price: 25,
        unit: 'kg',
        stock_quantity: 40,
        active: true,
        delivery_time_hours: 2
    }
})

export const onion_product = Record({
    $id: Now.ID['onion_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Red Onions',
        description: 'Fresh red onions from Maharashtra, essential for Indian cooking',
        category: 'vegetables',
        price: 35,
        unit: 'kg',
        stock_quantity: 60,
        active: true,
        delivery_time_hours: 2
    }
})

export const potato_product = Record({
    $id: Now.ID['potato_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Fresh Potatoes',
        description: 'Quality potatoes from Punjab, perfect for aloo dishes',
        category: 'vegetables',
        price: 20,
        unit: 'kg',
        stock_quantity: 80,
        active: true,
        delivery_time_hours: 2
    }
})

export const okra_product = Record({
    $id: Now.ID['okra_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Lady Finger (Okra)',
        description: 'Fresh bhindi/okra, tender and perfect for bhindi masala',
        category: 'vegetables',
        price: 40,
        unit: 'kg',
        stock_quantity: 25,
        active: true,
        delivery_time_hours: 2
    }
})

export const spinach_product = Record({
    $id: Now.ID['spinach_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Palak (Spinach)',
        description: 'Fresh green spinach leaves, ideal for palak paneer',
        category: 'vegetables',
        price: 30,
        unit: 'kg',
        stock_quantity: 35,
        active: true,
        delivery_time_hours: 2
    }
})

// DAIRY
export const milk_product = Record({
    $id: Now.ID['milk_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Amul Full Cream Milk',
        description: 'Fresh full cream milk from Amul, rich and creamy',
        category: 'dairy',
        price: 30,
        unit: 'litre',
        stock_quantity: 50,
        active: true,
        delivery_time_hours: 1
    }
})

export const paneer_product = Record({
    $id: Now.ID['paneer_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Fresh Paneer',
        description: 'Homemade style fresh paneer, perfect for curries',
        category: 'dairy',
        price: 320,
        unit: 'kg',
        stock_quantity: 15,
        active: true,
        delivery_time_hours: 1
    }
})

export const curd_product = Record({
    $id: Now.ID['curd_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Fresh Curd (Dahi)',
        description: 'Thick and creamy fresh curd, probiotic-rich',
        category: 'dairy',
        price: 60,
        unit: 'kg',
        stock_quantity: 30,
        active: true,
        delivery_time_hours: 1
    }
})

export const ghee_product = Record({
    $id: Now.ID['ghee_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Pure Cow Ghee',
        description: 'Pure cow ghee from Amul, perfect for cooking and sweets',
        category: 'dairy',
        price: 550,
        unit: 'kg',
        stock_quantity: 20,
        active: true,
        delivery_time_hours: 1
    }
})

// MEAT & SEAFOOD (Chicken and Fish popular in India)
export const chicken_product = Record({
    $id: Now.ID['chicken_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Fresh Chicken (Murgi)',
        description: 'Fresh chicken pieces, cleaned and cut, perfect for curry',
        category: 'meat',
        price: 180,
        unit: 'kg',
        stock_quantity: 25,
        active: true,
        delivery_time_hours: 1
    }
})

export const mutton_product = Record({
    $id: Now.ID['mutton_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Fresh Mutton (Bakra)',
        description: 'Fresh mutton pieces, perfect for biryani and curry',
        category: 'meat',
        price: 650,
        unit: 'kg',
        stock_quantity: 15,
        active: true,
        delivery_time_hours: 1
    }
})

export const fish_product = Record({
    $id: Now.ID['fish_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Pomfret Fish',
        description: 'Fresh pomfret fish, cleaned and cut, excellent for fish curry',
        category: 'meat',
        price: 400,
        unit: 'kg',
        stock_quantity: 12,
        active: true,
        delivery_time_hours: 1
    }
})

// GROCERIES & STAPLES
export const basmati_rice_product = Record({
    $id: Now.ID['basmati_rice_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Basmati Rice',
        description: 'Premium aged basmati rice, long grain, perfect for biryani',
        category: 'groceries',
        price: 150,
        unit: 'kg',
        stock_quantity: 100,
        active: true,
        delivery_time_hours: 3
    }
})

export const wheat_flour_product = Record({
    $id: Now.ID['wheat_flour_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Aashirvaad Atta (Wheat Flour)',
        description: 'Premium whole wheat flour for making rotis and parathas',
        category: 'groceries',
        price: 45,
        unit: 'kg',
        stock_quantity: 80,
        active: true,
        delivery_time_hours: 3
    }
})

export const toor_dal_product = Record({
    $id: Now.ID['toor_dal_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Toor Dal (Arhar Dal)',
        description: 'High-quality toor dal, protein-rich pigeon pea lentils',
        category: 'groceries',
        price: 120,
        unit: 'kg',
        stock_quantity: 60,
        active: true,
        delivery_time_hours: 3
    }
})

export const cooking_oil_product = Record({
    $id: Now.ID['cooking_oil_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Sunflower Oil',
        description: 'Refined sunflower cooking oil, heart-healthy option',
        category: 'groceries',
        price: 140,
        unit: 'litre',
        stock_quantity: 40,
        active: true,
        delivery_time_hours: 3
    }
})

// SPICES & MASALAS
export const turmeric_product = Record({
    $id: Now.ID['turmeric_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Haldi (Turmeric Powder)',
        description: 'Pure turmeric powder, essential for Indian cooking',
        category: 'spices',
        price: 80,
        unit: 'piece',
        stock_quantity: 50,
        active: true,
        delivery_time_hours: 2
    }
})

export const garam_masala_product = Record({
    $id: Now.ID['garam_masala_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'MDH Garam Masala',
        description: 'Aromatic garam masala blend, perfect for curries',
        category: 'spices',
        price: 45,
        unit: 'piece',
        stock_quantity: 35,
        active: true,
        delivery_time_hours: 2
    }
})

export const red_chili_product = Record({
    $id: Now.ID['red_chili_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Lal Mirch (Red Chili Powder)',
        description: 'Hot and spicy red chili powder from Guntur',
        category: 'spices',
        price: 120,
        unit: 'kg',
        stock_quantity: 40,
        active: true,
        delivery_time_hours: 2
    }
})

// BEVERAGES
export const tea_product = Record({
    $id: Now.ID['tea_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Tata Tea Gold',
        description: 'Premium black tea blend, perfect for Indian chai',
        category: 'beverages',
        price: 450,
        unit: 'kg',
        stock_quantity: 25,
        active: true,
        delivery_time_hours: 2
    }
})

export const coconut_water_product = Record({
    $id: Now.ID['coconut_water_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Fresh Coconut Water',
        description: 'Natural tender coconut water, refreshing and healthy',
        category: 'beverages',
        price: 35,
        unit: 'piece',
        stock_quantity: 30,
        active: true,
        delivery_time_hours: 2
    }
})

export const lassi_product = Record({
    $id: Now.ID['lassi_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Mango Lassi',
        description: 'Traditional mango lassi made with fresh curd and mangoes',
        category: 'beverages',
        price: 60,
        unit: 'piece',
        stock_quantity: 20,
        active: true,
        delivery_time_hours: 2
    }
})

export const mineral_water_product = Record({
    $id: Now.ID['mineral_water_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Bisleri Mineral Water',
        description: 'Pure mineral water, 1 litre bottles, pack of 12',
        category: 'beverages',
        price: 120,
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
        name: 'Ariel Washing Powder',
        description: 'High-quality washing powder for all fabric types',
        category: 'household',
        price: 280,
        unit: 'kg',
        stock_quantity: 25,
        active: true,
        delivery_time_hours: 4
    }
})

export const dish_soap_product = Record({
    $id: Now.ID['dish_soap_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Vim Dishwash Liquid',
        description: 'Powerful dishwashing liquid with lemon freshness',
        category: 'household',
        price: 185,
        unit: 'litre',
        stock_quantity: 30,
        active: true,
        delivery_time_hours: 4
    }
})

export const toilet_paper_product = Record({
    $id: Now.ID['toilet_paper_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Charmin Toilet Rolls',
        description: 'Soft and strong toilet paper rolls, pack of 8',
        category: 'household',
        price: 320,
        unit: 'piece',
        stock_quantity: 20,
        active: true,
        delivery_time_hours: 4
    }
})

export const broom_product = Record({
    $id: Now.ID['broom_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Coconut Broom (Jhadu)',
        description: 'Traditional coconut fiber broom for floor cleaning',
        category: 'household',
        price: 60,
        unit: 'piece',
        stock_quantity: 15,
        active: true,
        delivery_time_hours: 4
    }
})

// PERSONAL CARE
export const shampoo_product = Record({
    $id: Now.ID['shampoo_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Pantene Pro-V Shampoo',
        description: 'Nourishing shampoo for strong and healthy hair',
        category: 'personal_care',
        price: 285,
        unit: 'piece',
        stock_quantity: 25,
        active: true,
        delivery_time_hours: 3
    }
})

export const toothpaste_product = Record({
    $id: Now.ID['toothpaste_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Colgate Total Toothpaste',
        description: 'Advanced protection toothpaste with neem and clove',
        category: 'personal_care',
        price: 95,
        unit: 'piece',
        stock_quantity: 40,
        active: true,
        delivery_time_hours: 3
    }
})

export const soap_product = Record({
    $id: Now.ID['soap_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Lifebuoy Soap',
        description: 'Antibacterial soap with natural ingredients, pack of 4',
        category: 'personal_care',
        price: 120,
        unit: 'piece',
        stock_quantity: 35,
        active: true,
        delivery_time_hours: 3
    }
})

export const hair_oil_product = Record({
    $id: Now.ID['hair_oil_prod'],
    table: 'x_1599224_online_d_product',
    data: {
        name: 'Parachute Coconut Oil',
        description: 'Pure coconut hair oil for strong and healthy hair',
        category: 'personal_care',
        price: 180,
        unit: 'piece',
        stock_quantity: 30,
        active: true,
        delivery_time_hours: 3
    }
})
import { gs, GlideRecord } from '@servicenow/glide';

export function createSampleProducts() {
    gs.info('Starting sample product creation...');
    
    const sampleProducts = [
        {
            name: 'Fresh Red Apples',
            description: 'Crisp and sweet red apples, perfect for snacking or baking',
            category: 'fruits',
            price: 2.99,
            unit: 'pound',
            stock_quantity: 50,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'Organic Bananas',
            description: 'Yellow organic bananas, great source of potassium and natural energy',
            category: 'fruits',
            price: 1.89,
            unit: 'pound',
            stock_quantity: 75,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'Fresh Strawberries',
            description: 'Sweet, juicy strawberries perfect for desserts and snacking',
            category: 'fruits',
            price: 4.99,
            unit: 'piece',
            stock_quantity: 35,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'Roma Tomatoes',
            description: 'Fresh roma tomatoes, perfect for cooking and salads',
            category: 'vegetables',
            price: 2.49,
            unit: 'pound',
            stock_quantity: 40,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'Baby Spinach',
            description: 'Tender baby spinach leaves, great for salads and smoothies',
            category: 'vegetables',
            price: 3.99,
            unit: 'piece',
            stock_quantity: 20,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'Whole Milk',
            description: 'Fresh whole milk from local dairy farms, rich and creamy',
            category: 'dairy',
            price: 4.29,
            unit: 'gallon',
            stock_quantity: 30,
            active: true,
            delivery_time_hours: 1
        },
        {
            name: 'Cheddar Cheese',
            description: 'Sharp aged cheddar cheese, perfect for sandwiches and cooking',
            category: 'dairy',
            price: 5.99,
            unit: 'piece',
            stock_quantity: 22,
            active: true,
            delivery_time_hours: 1
        },
        {
            name: 'Chicken Breast',
            description: 'Fresh boneless, skinless chicken breast, lean and tender',
            category: 'meat',
            price: 8.99,
            unit: 'pound',
            stock_quantity: 15,
            active: true,
            delivery_time_hours: 1
        },
        {
            name: 'Whole Wheat Bread',
            description: 'Freshly baked whole wheat bread, rich in fiber',
            category: 'groceries',
            price: 3.49,
            unit: 'piece',
            stock_quantity: 25,
            active: true,
            delivery_time_hours: 3
        },
        {
            name: 'Orange Juice',
            description: 'Freshly squeezed orange juice, no pulp, vitamin C enriched',
            category: 'beverages',
            price: 5.99,
            unit: 'piece',
            stock_quantity: 35,
            active: true,
            delivery_time_hours: 2
        }
    ];

    let created = 0;
    let skipped = 0;

    for (const product of sampleProducts) {
        // Check if product already exists
        const existingProduct = new GlideRecord('x_1599224_online_d_product');
        existingProduct.addQuery('name', product.name);
        existingProduct.query();
        
        if (existingProduct.hasNext()) {
            gs.info(`Product already exists: ${product.name}`);
            skipped++;
            continue;
        }

        // Create new product
        const newProduct = new GlideRecord('x_1599224_online_d_product');
        newProduct.initialize();
        
        newProduct.setValue('name', product.name);
        newProduct.setValue('description', product.description);
        newProduct.setValue('category', product.category);
        newProduct.setValue('price', product.price);
        newProduct.setValue('unit', product.unit);
        newProduct.setValue('stock_quantity', product.stock_quantity);
        newProduct.setValue('active', product.active);
        newProduct.setValue('delivery_time_hours', product.delivery_time_hours);
        
        const sysId = newProduct.insert();
        if (sysId) {
            gs.info(`Created product: ${product.name} (${sysId})`);
            created++;
        } else {
            gs.error(`Failed to create product: ${product.name}`);
        }
    }

    gs.info(`Sample product creation completed. Created: ${created}, Skipped: ${skipped}`);
    return { created, skipped };
}
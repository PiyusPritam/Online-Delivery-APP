import { gs, GlideRecord } from '@servicenow/glide';

export function createSampleProducts() {
    gs.info('Starting sample product creation...');
    
    const sampleProducts = [
        {
            name: 'Alphonso Mangoes',
            description: 'Premium Alphonso mangoes from Ratnagiri, sweet and juicy',
            category: 'fruits',
            price: 120,
            unit: 'kg',
            stock_quantity: 50,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'Robusta Bananas',
            description: 'Fresh robusta bananas from Kerala, rich in potassium',
            category: 'fruits',
            price: 40,
            unit: 'dozen',
            stock_quantity: 75,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'Maharashtra Pomegranates',
            description: 'Fresh pomegranates packed with antioxidants, ruby red arils',
            category: 'fruits',
            price: 180,
            unit: 'kg',
            stock_quantity: 35,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'Fresh Tomatoes',
            description: 'Fresh red tomatoes, perfect for curries and salads',
            category: 'vegetables',
            price: 25,
            unit: 'kg',
            stock_quantity: 40,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'Red Onions',
            description: 'Fresh red onions from Maharashtra, essential for Indian cooking',
            category: 'vegetables',
            price: 35,
            unit: 'kg',
            stock_quantity: 60,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'Fresh Potatoes',
            description: 'Quality potatoes from Punjab, perfect for aloo dishes',
            category: 'vegetables',
            price: 20,
            unit: 'kg',
            stock_quantity: 80,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'Amul Full Cream Milk',
            description: 'Fresh full cream milk from Amul, rich and creamy',
            category: 'dairy',
            price: 30,
            unit: 'litre',
            stock_quantity: 50,
            active: true,
            delivery_time_hours: 1
        },
        {
            name: 'Fresh Paneer',
            description: 'Homemade style fresh paneer, perfect for curries',
            category: 'dairy',
            price: 320,
            unit: 'kg',
            stock_quantity: 15,
            active: true,
            delivery_time_hours: 1
        },
        {
            name: 'Fresh Chicken (Murgi)',
            description: 'Fresh chicken pieces, cleaned and cut, perfect for curry',
            category: 'meat',
            price: 180,
            unit: 'kg',
            stock_quantity: 25,
            active: true,
            delivery_time_hours: 1
        },
        {
            name: 'Basmati Rice',
            description: 'Premium aged basmati rice, long grain, perfect for biryani',
            category: 'groceries',
            price: 150,
            unit: 'kg',
            stock_quantity: 100,
            active: true,
            delivery_time_hours: 3
        },
        {
            name: 'Aashirvaad Atta (Wheat Flour)',
            description: 'Premium whole wheat flour for making rotis and parathas',
            category: 'groceries',
            price: 45,
            unit: 'kg',
            stock_quantity: 80,
            active: true,
            delivery_time_hours: 3
        },
        {
            name: 'Toor Dal (Arhar Dal)',
            description: 'High-quality toor dal, protein-rich pigeon pea lentils',
            category: 'groceries',
            price: 120,
            unit: 'kg',
            stock_quantity: 60,
            active: true,
            delivery_time_hours: 3
        },
        {
            name: 'Haldi (Turmeric Powder)',
            description: 'Pure turmeric powder, essential for Indian cooking',
            category: 'spices',
            price: 80,
            unit: 'piece',
            stock_quantity: 50,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'MDH Garam Masala',
            description: 'Aromatic garam masala blend, perfect for curries',
            category: 'spices',
            price: 45,
            unit: 'piece',
            stock_quantity: 35,
            active: true,
            delivery_time_hours: 2
        },
        {
            name: 'Tata Tea Gold',
            description: 'Premium black tea blend, perfect for Indian chai',
            category: 'beverages',
            price: 450,
            unit: 'kg',
            stock_quantity: 25,
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
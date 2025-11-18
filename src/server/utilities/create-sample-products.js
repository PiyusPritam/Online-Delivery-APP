import { gs } from '@servicenow/glide';
import { GlideRecord } from '@servicenow/glide';
import { GlideDateTime } from '@servicenow/glide';

export function createSampleData(current, previous) {
    try {
        // Check if sample data already exists
        var productGr = new GlideRecord('x_1599224_online_d_product');
        productGr.query();
        if (productGr.getRowCount() > 0) {
            gs.log('Sample data already exists, skipping initialization', 'SampleDataInit');
            return;
        }

        gs.log('Creating sample data for delivery app', 'SampleDataInit');

        // Create sample customer
        var customerGr = new GlideRecord('x_1599224_online_d_customer');
        customerGr.initialize();
        customerGr.setValue('email', 'demo@customer.com');
        customerGr.setValue('first_name', 'Demo');
        customerGr.setValue('last_name', 'Customer');
        customerGr.setValue('phone', '+1-555-0123');
        customerGr.setValue('active', true);
        var customerId = customerGr.insert();

        // Create sample address
        var addressGr = new GlideRecord('x_1599224_online_d_address');
        addressGr.initialize();
        addressGr.setValue('customer', customerId);
        addressGr.setValue('address_line_1', '123 Demo Street');
        addressGr.setValue('address_line_2', 'Apt 4B');
        addressGr.setValue('city', 'Demo City');
        addressGr.setValue('state', 'CA');
        addressGr.setValue('zip_code', '90210');
        addressGr.setValue('is_default', true);
        var addressId = addressGr.insert();

        // Create sample products
        var products = [
            { name: 'Fresh Mango', category: 'fruits', price: 4.99, unit: 'piece', description: 'Sweet and juicy mangoes', stock: 50 },
            { name: 'Organic Banana', category: 'fruits', price: 2.99, unit: 'dozen', description: 'Fresh organic bananas', stock: 100 },
            { name: 'Red Tomatoes', category: 'vegetables', price: 3.49, unit: 'lb', description: 'Fresh red tomatoes', stock: 75 },
            { name: 'Fresh Milk', category: 'dairy', price: 5.99, unit: 'gallon', description: 'Fresh whole milk', stock: 30 },
            { name: 'Basmati Rice', category: 'grains', price: 8.99, unit: 'bag', description: 'Premium basmati rice 5lb', stock: 25 }
        ];

        var productIds = [];
        for (var i = 0; i < products.length; i++) {
            var product = products[i];
            var prodGr = new GlideRecord('x_1599224_online_d_product');
            prodGr.initialize();
            prodGr.setValue('name', product.name);
            prodGr.setValue('category', product.category);
            prodGr.setValue('price', product.price);
            prodGr.setValue('unit', product.unit);
            prodGr.setValue('description', product.description);
            prodGr.setValue('available_stock', product.stock);
            prodGr.setValue('active', true);
            var prodId = prodGr.insert();
            productIds.push(prodId);
        }

        // Create sample orders with different statuses
        var orderStatuses = ['delivered', 'out_for_delivery', 'preparing', 'confirmed'];
        var orderDates = [-7, -3, -1, 0]; // Days ago

        for (var j = 0; j < orderStatuses.length; j++) {
            var status = orderStatuses[j];
            var daysAgo = orderDates[j];
            
            var orderGr = new GlideRecord('x_1599224_online_d_order');
            orderGr.initialize();
            orderGr.setValue('customer', customerId);
            orderGr.setValue('delivery_address', addressId);
            orderGr.setValue('status', status);
            orderGr.setValue('payment_method', 'credit_card');
            orderGr.setValue('delivery_fee', 5.99);
            
            // Set order date
            var orderDate = new GlideDateTime();
            orderDate.addDays(daysAgo);
            orderGr.setValue('order_date', orderDate);
            
            // Set estimated delivery
            var estDelivery = new GlideDateTime(orderDate);
            estDelivery.addMinutes(30);
            orderGr.setValue('estimated_delivery', estDelivery);
            
            // Set actual delivery for delivered orders
            if (status === 'delivered') {
                var actualDelivery = new GlideDateTime(orderDate);
                actualDelivery.addMinutes(25);
                orderGr.setValue('actual_delivery', actualDelivery);
            }
            
            var orderId = orderGr.insert();
            
            // Create order items
            var totalAmount = 0;
            var numItems = Math.floor(Math.random() * 3) + 2; // 2-4 items per order
            
            for (var k = 0; k < numItems && k < productIds.length; k++) {
                var itemGr = new GlideRecord('x_1599224_online_d_order_item');
                itemGr.initialize();
                itemGr.setValue('order', orderId);
                itemGr.setValue('product', productIds[k]);
                itemGr.setValue('quantity', Math.floor(Math.random() * 3) + 1);
                itemGr.setValue('unit_price', products[k].price);
                
                var itemTotal = itemGr.getValue('quantity') * products[k].price;
                itemGr.setValue('total_price', itemTotal);
                totalAmount += itemTotal;
                
                itemGr.insert();
            }
            
            // Update order total
            orderGr.get(orderId);
            orderGr.setValue('total_amount', totalAmount + 5.99);
            orderGr.update();
        }

        gs.log('Sample data created successfully', 'SampleDataInit');
        gs.addInfoMessage('Sample data has been created for the delivery app');

    } catch (error) {
        gs.logError('Error creating sample data: ' + error.getMessage(), 'SampleDataInit');
    }
}
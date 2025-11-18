import { gs } from '@servicenow/glide';
import { GlideRecord } from '@servicenow/glide';

export function saveCartToSession(customerId, cartData) {
    try {
        if (!customerId || !cartData) {
            gs.addErrorMessage('Invalid parameters for cart save');
            return false;
        }

        // Store cart data in user preferences table for persistence
        var gr = new GlideRecord('sys_user_preference');
        gr.addQuery('user', customerId);
        gr.addQuery('name', 'delivery_app_cart');
        gr.query();

        if (gr.next()) {
            // Update existing cart
            gr.setValue('value', JSON.stringify(cartData));
            gr.update();
        } else {
            // Create new cart entry
            gr.initialize();
            gr.setValue('user', customerId);
            gr.setValue('name', 'delivery_app_cart');
            gr.setValue('value', JSON.stringify(cartData));
            gr.insert();
        }

        return true;
    } catch (error) {
        gs.logError('Error saving cart: ' + error.getMessage(), 'CartManager');
        return false;
    }
}

export function loadCartFromSession(customerId) {
    try {
        if (!customerId) {
            return [];
        }

        var gr = new GlideRecord('sys_user_preference');
        gr.addQuery('user', customerId);
        gr.addQuery('name', 'delivery_app_cart');
        gr.query();

        if (gr.next()) {
            var cartData = gr.getValue('value');
            if (cartData) {
                return JSON.parse(cartData);
            }
        }

        return [];
    } catch (error) {
        gs.logError('Error loading cart: ' + error.getMessage(), 'CartManager');
        return [];
    }
}

export function clearCartFromSession(customerId) {
    try {
        if (!customerId) {
            return false;
        }

        var gr = new GlideRecord('sys_user_preference');
        gr.addQuery('user', customerId);
        gr.addQuery('name', 'delivery_app_cart');
        gr.query();

        if (gr.next()) {
            gr.deleteRecord();
        }

        return true;
    } catch (error) {
        gs.logError('Error clearing cart: ' + error.getMessage(), 'CartManager');
        return false;
    }
}

export function createOrderFromCart(orderData, cartItems) {
    try {
        if (!orderData || !cartItems || cartItems.length === 0) {
            gs.addErrorMessage('Invalid order data or empty cart');
            return null;
        }

        // Create the main order record
        var orderGr = new GlideRecord('x_1599224_online_d_order');
        orderGr.initialize();
        
        // Set order fields
        orderGr.setValue('customer', orderData.customer);
        orderGr.setValue('delivery_address', orderData.delivery_address);
        orderGr.setValue('payment_method', orderData.payment_method);
        orderGr.setValue('delivery_instructions', orderData.delivery_instructions || '');
        orderGr.setValue('delivery_fee', orderData.delivery_fee || 5.99);
        orderGr.setValue('status', orderData.status || 'pending');
        
        var orderId = orderGr.insert();
        
        if (!orderId) {
            gs.addErrorMessage('Failed to create order');
            return null;
        }

        var totalAmount = 0;
        var deliveryFee = parseFloat(orderData.delivery_fee || 5.99);

        // Create order items
        for (var i = 0; i < cartItems.length; i++) {
            var item = cartItems[i];
            
            var itemGr = new GlideRecord('x_1599224_online_d_order_item');
            itemGr.initialize();
            itemGr.setValue('order', orderId);
            itemGr.setValue('product', item.productId);
            itemGr.setValue('quantity', item.quantity);
            itemGr.setValue('unit_price', item.unitPrice);
            
            var itemTotal = parseFloat(item.unitPrice) * parseInt(item.quantity);
            itemGr.setValue('total_price', itemTotal);
            
            itemGr.insert();
            totalAmount += itemTotal;
        }

        // Update order with total amount
        orderGr.get(orderId);
        orderGr.setValue('total_amount', totalAmount + deliveryFee);
        orderGr.update();

        // Clear cart after successful order
        clearCartFromSession(orderData.customer);

        gs.addInfoMessage('Order created successfully with ID: ' + orderGr.getDisplayValue('order_number'));
        
        return {
            sys_id: orderId,
            order_number: orderGr.getDisplayValue('order_number'),
            total_amount: totalAmount + deliveryFee
        };

    } catch (error) {
        gs.logError('Error creating order: ' + error.getMessage(), 'CartManager');
        gs.addErrorMessage('Failed to create order: ' + error.getMessage());
        return null;
    }
}

export function getOrderItemsForReorder(orderId) {
    try {
        if (!orderId) {
            return [];
        }

        var items = [];
        var gr = new GlideRecord('x_1599224_online_d_order_item');
        gr.addQuery('order', orderId);
        gr.query();

        while (gr.next()) {
            // Get product details
            var productGr = new GlideRecord('x_1599224_online_d_product');
            if (productGr.get(gr.getValue('product'))) {
                items.push({
                    productId: gr.getValue('product'),
                    productName: productGr.getDisplayValue('name'),
                    unitPrice: gr.getValue('unit_price'),
                    quantity: gr.getValue('quantity'),
                    product: {
                        sys_id: { value: gr.getValue('product') },
                        name: { display_value: productGr.getDisplayValue('name') },
                        price: { display_value: gr.getValue('unit_price') },
                        unit: { display_value: productGr.getDisplayValue('unit') },
                        description: { display_value: productGr.getDisplayValue('description') },
                        category: { display_value: productGr.getDisplayValue('category') },
                        available_stock: { display_value: productGr.getDisplayValue('available_stock') }
                    }
                });
            }
        }

        return items;
    } catch (error) {
        gs.logError('Error getting order items for reorder: ' + error.getMessage(), 'CartManager');
        return [];
    }
}
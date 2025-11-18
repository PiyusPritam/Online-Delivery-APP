var CartManagerAPI = Class.create();

CartManagerAPI.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    
    saveCart: function() {
        var customerId = this.getParameter('sysparm_customer_id');
        var cartData = this.getParameter('sysparm_cart_data');
        
        if (!customerId || !cartData) {
            return JSON.stringify({ success: false, error: 'Missing required parameters' });
        }
        
        try {
            var parsedCartData = JSON.parse(cartData);
            var success = this._saveCartToSession(customerId, parsedCartData);
            
            return JSON.stringify({ 
                success: success,
                message: success ? 'Cart saved successfully' : 'Failed to save cart'
            });
        } catch (error) {
            gs.logError('Error in saveCart: ' + error.getMessage(), 'CartManagerAPI');
            return JSON.stringify({ success: false, error: error.getMessage() });
        }
    },
    
    loadCart: function() {
        var customerId = this.getParameter('sysparm_customer_id');
        
        if (!customerId) {
            return JSON.stringify({ success: false, error: 'Customer ID required' });
        }
        
        try {
            var cartData = this._loadCartFromSession(customerId);
            
            return JSON.stringify({ 
                success: true,
                cart: cartData || []
            });
        } catch (error) {
            gs.logError('Error in loadCart: ' + error.getMessage(), 'CartManagerAPI');
            return JSON.stringify({ success: false, error: error.getMessage() });
        }
    },
    
    clearCart: function() {
        var customerId = this.getParameter('sysparm_customer_id');
        
        if (!customerId) {
            return JSON.stringify({ success: false, error: 'Customer ID required' });
        }
        
        try {
            var success = this._clearCartFromSession(customerId);
            
            return JSON.stringify({ 
                success: success,
                message: success ? 'Cart cleared successfully' : 'Failed to clear cart'
            });
        } catch (error) {
            gs.logError('Error in clearCart: ' + error.getMessage(), 'CartManagerAPI');
            return JSON.stringify({ success: false, error: error.getMessage() });
        }
    },
    
    getOrderItemsForReorder: function() {
        var orderId = this.getParameter('sysparm_order_id');
        
        if (!orderId) {
            return JSON.stringify({ success: false, error: 'Order ID required' });
        }
        
        try {
            var items = this._getOrderItemsForReorder(orderId);
            
            return JSON.stringify({ 
                success: true,
                items: items
            });
        } catch (error) {
            gs.logError('Error in getOrderItemsForReorder: ' + error.getMessage(), 'CartManagerAPI');
            return JSON.stringify({ success: false, error: error.getMessage() });
        }
    },
    
    // Private helper methods
    _saveCartToSession: function(customerId, cartData) {
        try {
            if (!customerId || !cartData) {
                return false;
            }

            var gr = new GlideRecord('sys_user_preference');
            gr.addQuery('user', customerId);
            gr.addQuery('name', 'delivery_app_cart');
            gr.query();

            if (gr.next()) {
                gr.setValue('value', JSON.stringify(cartData));
                gr.update();
            } else {
                gr.initialize();
                gr.setValue('user', customerId);
                gr.setValue('name', 'delivery_app_cart');
                gr.setValue('value', JSON.stringify(cartData));
                gr.insert();
            }

            return true;
        } catch (error) {
            gs.logError('Error saving cart: ' + error.getMessage(), 'CartManagerAPI');
            return false;
        }
    },
    
    _loadCartFromSession: function(customerId) {
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
            gs.logError('Error loading cart: ' + error.getMessage(), 'CartManagerAPI');
            return [];
        }
    },
    
    _clearCartFromSession: function(customerId) {
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
            gs.logError('Error clearing cart: ' + error.getMessage(), 'CartManagerAPI');
            return false;
        }
    },
    
    _getOrderItemsForReorder: function(orderId) {
        try {
            if (!orderId) {
                return [];
            }

            var items = [];
            var gr = new GlideRecord('x_1599224_online_d_order_item');
            gr.addQuery('order', orderId);
            gr.query();

            while (gr.next()) {
                var productGr = new GlideRecord('x_1599224_online_d_product');
                if (productGr.get(gr.getValue('product'))) {
                    items.push({
                        productId: gr.getValue('product'),
                        quantity: parseInt(gr.getValue('quantity')),
                        product: {
                            sys_id: { value: gr.getValue('product') },
                            name: { display_value: productGr.getDisplayValue('name') },
                            price: { display_value: gr.getValue('unit_price') },
                            unit: { display_value: productGr.getDisplayValue('unit') },
                            description: { display_value: productGr.getDisplayValue('description') },
                            category: { display_value: productGr.getDisplayValue('category') }
                        }
                    });
                }
            }

            return items;
        } catch (error) {
            gs.logError('Error getting order items for reorder: ' + error.getMessage(), 'CartManagerAPI');
            return [];
        }
    },
    
    type: 'CartManagerAPI'
});
import { gs } from '@servicenow/glide';
import { GlideRecord } from '@servicenow/glide';

export function cleanupCartOnOrder(current, previous) {
    try {
        var customerId = current.getValue('customer');
        
        if (customerId) {
            // Clean up the user's cart after successful order creation
            var gr = new GlideRecord('sys_user_preference');
            gr.addQuery('user', customerId);
            gr.addQuery('name', 'delivery_app_cart');
            gr.query();
            
            if (gr.next()) {
                gr.deleteRecord();
                gs.log('Cart cleared for customer ' + customerId + ' after order creation', 'CartCleanup');
            }
        }
        
    } catch (error) {
        gs.logError('Error cleaning up cart after order: ' + error.getMessage(), 'CartCleanup');
    }
}
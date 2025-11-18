import { gs } from '@servicenow/glide';
import { GlideDateTime } from '@servicenow/glide';

export function handleOrderStatusNotification(current, previous) {
    try {
        var status = current.getValue('status');
        var orderNumber = current.getDisplayValue('order_number');
        var customerSysId = current.getValue('customer');
        
        // Set estimated delivery time based on status
        if (current.isNewRecord() && status === 'pending') {
            var now = new GlideDateTime();
            now.addMinutes(30); // 30 minutes from now
            current.setValue('estimated_delivery', now);
            current.setValue('order_date', new GlideDateTime());
        }
        
        // Set actual delivery time when delivered
        if (status === 'delivered' && (!current.getValue('actual_delivery') || current.getValue('actual_delivery') === '')) {
            current.setValue('actual_delivery', new GlideDateTime());
        }
        
        // Get customer information for notifications
        var customerGr = gs.getSession().isReference('x_1599224_online_d_customer', customerSysId);
        if (customerGr) {
            var customer = new GlideRecord('x_1599224_online_d_customer');
            if (customer.get(customerSysId)) {
                var customerEmail = customer.getValue('email');
                var customerName = customer.getDisplayValue('first_name') + ' ' + customer.getDisplayValue('last_name');
                
                // Create status-specific messages
                var message = '';
                var subject = '';
                
                switch (status) {
                    case 'confirmed':
                        subject = 'Order Confirmed - ' + orderNumber;
                        message = 'Dear ' + customerName + ',\n\nYour order ' + orderNumber + ' has been confirmed and is being prepared.\n\nEstimated delivery: ' + current.getDisplayValue('estimated_delivery') + '\n\nThank you for your order!';
                        break;
                    case 'preparing':
                        subject = 'Order Being Prepared - ' + orderNumber;
                        message = 'Dear ' + customerName + ',\n\nYour order ' + orderNumber + ' is now being prepared.\n\nYou will receive another update when your order is out for delivery.';
                        break;
                    case 'out_for_delivery':
                        subject = 'Order Out for Delivery - ' + orderNumber;
                        message = 'Dear ' + customerName + ',\n\nGreat news! Your order ' + orderNumber + ' is now out for delivery.\n\nExpected delivery: ' + current.getDisplayValue('estimated_delivery') + '\n\nPlease ensure someone is available to receive the order.';
                        break;
                    case 'delivered':
                        subject = 'Order Delivered - ' + orderNumber;
                        message = 'Dear ' + customerName + ',\n\nYour order ' + orderNumber + ' has been successfully delivered.\n\nDelivered at: ' + current.getDisplayValue('actual_delivery') + '\n\nThank you for choosing our service! We hope you enjoyed your order.';
                        break;
                    case 'cancelled':
                        subject = 'Order Cancelled - ' + orderNumber;
                        message = 'Dear ' + customerName + ',\n\nYour order ' + orderNumber + ' has been cancelled.\n\nIf you have any questions, please contact our customer service.\n\nWe apologize for any inconvenience.';
                        break;
                }
                
                // Send notification (add to info messages for now, could be extended to email)
                if (message) {
                    gs.addInfoMessage('Order ' + orderNumber + ' status updated to: ' + current.getDisplayValue('status'));
                    
                    // Log the notification for audit trail
                    gs.log('Order status notification sent for order ' + orderNumber + ' to customer ' + customerEmail + '. Status: ' + status, 'OrderNotifications');
                }
            }
        }
        
    } catch (error) {
        gs.logError('Error in order status notification: ' + error.getMessage(), 'OrderNotifications');
    }
}
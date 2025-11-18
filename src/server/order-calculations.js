import { gs, GlideDateTime } from '@servicenow/glide';

export function calculateOrderTotal(current, previous) {
    // Calculate total amount for order when order items change
    var orderSysId = typeof current.order === 'object' ? current.order.value : current.order;
    
    var orderItemsGR = new GlideRecord('x_1599224_online_d_order_item');
    orderItemsGR.addQuery('order', orderSysId);
    orderItemsGR.query();
    
    var totalAmount = 0;
    while (orderItemsGR.next()) {
        var quantity = parseInt(orderItemsGR.getValue('quantity')) || 0;
        var unitPrice = parseFloat(orderItemsGR.getValue('unit_price')) || 0;
        totalAmount += quantity * unitPrice;
    }
    
    // Update the order total
    var orderGR = new GlideRecord('x_1599224_online_d_order');
    if (orderGR.get(orderSysId)) {
        var deliveryFee = parseFloat(orderGR.getValue('delivery_fee')) || 0;
        orderGR.setValue('total_amount', totalAmount + deliveryFee);
        orderGR.update();
    }
}

export function setOrderDate(current, previous) {
    if (current.isNewRecord()) {
        var now = new GlideDateTime();
        current.setValue('order_date', now.getDisplayValue());
        
        // Calculate estimated delivery (24 hours from order)
        var estimatedDelivery = new GlideDateTime();
        estimatedDelivery.addDaysUTC(1);
        current.setValue('estimated_delivery', estimatedDelivery.getDisplayValue());
    }
}

export function calculateOrderItemTotal(current, previous) {
    var quantity = parseInt(current.getValue('quantity')) || 0;
    var unitPrice = parseFloat(current.getValue('unit_price')) || 0;
    current.setValue('total_price', quantity * unitPrice);
}
import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'

export const OrderStatusNotification = BusinessRule({
    $id: Now.ID['order_status_notification'],
    name: 'Order Status Notification',
    table: 'x_1599224_online_d_order',
    when: 'after',
    action: ['insert', 'update'],
    script: Now.include('../../server/order-notifications.js'),
    order: 100,
    active: true,
    condition: "current.status.changes() || current.isNewRecord()"
})
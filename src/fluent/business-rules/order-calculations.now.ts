import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'
import { calculateOrderItemTotal, calculateOrderTotal } from '../../server/order-calculations.js'

BusinessRule({
    $id: Now.ID['order_item_total_br'],
    name: 'Calculate Order Item Total',
    table: 'x_1599224_online_d_order_item',
    when: 'before',
    action: ['insert', 'update'],
    script: calculateOrderItemTotal,
    order: 100,
    active: true
})

BusinessRule({
    $id: Now.ID['order_total_br'],
    name: 'Calculate Order Total',
    table: 'x_1599224_online_d_order_item',
    when: 'after',
    action: ['insert', 'update', 'delete'],
    script: calculateOrderTotal,
    order: 200,
    active: true
})
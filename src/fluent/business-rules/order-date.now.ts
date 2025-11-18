import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'
import { setOrderDate } from '../../server/order-calculations.js'

BusinessRule({
    $id: Now.ID['order_date_br'],
    name: 'Set Order Date',
    table: 'x_1599224_online_d_order',
    when: 'before',
    action: ['insert'],
    script: setOrderDate,
    order: 100,
    active: true
})
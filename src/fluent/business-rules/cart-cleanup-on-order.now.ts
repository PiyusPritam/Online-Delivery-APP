import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'

export const CartCleanupOnOrder = BusinessRule({
    $id: Now.ID['cart_cleanup_on_order'],
    name: 'Cart Cleanup on Order',
    table: 'x_1599224_online_d_order',
    when: 'after',
    action: ['insert'],
    script: Now.include('../../server/cart/cart-cleanup.js'),
    order: 200,
    active: true,
    condition: "current.isNewRecord()"
})
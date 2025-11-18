import '@servicenow/sdk/global'
import { Table, ReferenceColumn, IntegerColumn, DecimalColumn } from '@servicenow/sdk/core'

export const x_1599224_online_d_order_item = Table({
    name: 'x_1599224_online_d_order_item',
    label: 'Order Item',
    schema: {
        order: ReferenceColumn({
            label: 'Order',
            referenceTable: 'x_1599224_online_d_order',
            mandatory: true
        }),
        product: ReferenceColumn({
            label: 'Product',
            referenceTable: 'x_1599224_online_d_product',
            mandatory: true
        }),
        quantity: IntegerColumn({
            label: 'Quantity',
            mandatory: true,
            default: 1,
            min: 1
        }),
        unit_price: DecimalColumn({
            label: 'Unit Price ($)',
            mandatory: true
        }),
        total_price: DecimalColumn({
            label: 'Total Price ($)',
            read_only: true
        })
    },
    actions: ['create', 'read', 'update', 'delete'],
    accessible_from: 'public',
    caller_access: 'tracking',
    allow_web_service_access: true,
    display: 'product'
})
import '@servicenow/sdk/global'
import { Table, StringColumn, DecimalColumn, BooleanColumn, IntegerColumn } from '@servicenow/sdk/core'

export const x_1599224_online_d_product = Table({
    name: 'x_1599224_online_d_product',
    label: 'Product',
    schema: {
        name: StringColumn({
            label: 'Product Name',
            maxLength: 100,
            mandatory: true
        }),
        description: StringColumn({
            label: 'Description',
            maxLength: 500
        }),
        category: StringColumn({
            label: 'Category',
            choices: {
                groceries: { label: 'Groceries', sequence: 0 },
                vegetables: { label: 'Vegetables', sequence: 1 },
                fruits: { label: 'Fruits', sequence: 2 },
                dairy: { label: 'Dairy', sequence: 3 },
                meat: { label: 'Meat & Seafood', sequence: 4 },
                beverages: { label: 'Beverages', sequence: 5 },
                household: { label: 'Household Items', sequence: 6 },
                personal_care: { label: 'Personal Care', sequence: 7 }
            },
            dropdown: 'dropdown_with_none',
            mandatory: true
        }),
        price: DecimalColumn({
            label: 'Price per Unit ($)',
            mandatory: true
        }),
        unit: StringColumn({
            label: 'Unit Type',
            choices: {
                piece: { label: 'Per Piece', sequence: 0 },
                pound: { label: 'Per Pound (lb)', sequence: 1 },
                kilogram: { label: 'Per Kilogram (kg)', sequence: 2 },
                liter: { label: 'Per Liter', sequence: 3 },
                gallon: { label: 'Per Gallon', sequence: 4 },
                dozen: { label: 'Per Dozen', sequence: 5 }
            },
            dropdown: 'dropdown_with_none',
            default: 'piece'
        }),
        stock_quantity: IntegerColumn({
            label: 'Stock Quantity',
            default: 0
        }),
        image_url: StringColumn({
            label: 'Product Image URL',
            maxLength: 255
        }),
        active: BooleanColumn({
            label: 'Active',
            default: true
        }),
        delivery_time_hours: IntegerColumn({
            label: 'Delivery Time (Hours)',
            default: 24
        })
    },
    actions: ['create', 'read', 'update', 'delete'],
    accessible_from: 'public',
    caller_access: 'none', // Changed from 'tracking' to 'none' for better API access
    allow_web_service_access: true,
    display: 'name'
})
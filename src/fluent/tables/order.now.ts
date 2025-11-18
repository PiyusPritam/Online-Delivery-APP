import '@servicenow/sdk/global'
import { Table, StringColumn, DecimalColumn, ReferenceColumn, DateTimeColumn } from '@servicenow/sdk/core'

export const x_1599224_online_d_order = Table({
    name: 'x_1599224_online_d_order',
    label: 'Order',
    schema: {
        order_number: StringColumn({
            label: 'Order Number',
            maxLength: 20,
            read_only: true
        }),
        customer: ReferenceColumn({
            label: 'Customer',
            referenceTable: 'x_1599224_online_d_customer',
            mandatory: true
        }),
        delivery_address: ReferenceColumn({
            label: 'Delivery Address',
            referenceTable: 'x_1599224_online_d_address',
            mandatory: true
        }),
        total_amount: DecimalColumn({
            label: 'Total Amount ($)',
            read_only: true
        }),
        status: StringColumn({
            label: 'Order Status',
            choices: {
                pending: { label: 'Pending', sequence: 0 },
                confirmed: { label: 'Confirmed', sequence: 1 },
                preparing: { label: 'Preparing', sequence: 2 },
                out_for_delivery: { label: 'Out for Delivery', sequence: 3 },
                delivered: { label: 'Delivered', sequence: 4 },
                cancelled: { label: 'Cancelled', sequence: 5 }
            },
            default: 'pending',
            dropdown: 'dropdown_with_none'
        }),
        order_date: DateTimeColumn({
            label: 'Order Date',
            read_only: true
        }),
        estimated_delivery: DateTimeColumn({
            label: 'Estimated Delivery Time'
        }),
        actual_delivery: DateTimeColumn({
            label: 'Actual Delivery Time'
        }),
        delivery_instructions: StringColumn({
            label: 'Delivery Instructions',
            maxLength: 500
        }),
        payment_method: StringColumn({
            label: 'Payment Method',
            choices: {
                credit_card: { label: 'Credit Card', sequence: 0 },
                debit_card: { label: 'Debit Card', sequence: 1 },
                paypal: { label: 'PayPal', sequence: 2 },
                cash_on_delivery: { label: 'Cash on Delivery', sequence: 3 }
            },
            dropdown: 'dropdown_with_none'
        }),
        delivery_fee: DecimalColumn({
            label: 'Delivery Fee ($)',
            default: 5.99
        }),
        driver_notes: StringColumn({
            label: 'Driver Notes',
            maxLength: 500
        })
    },
    actions: ['create', 'read', 'update', 'delete'],
    accessible_from: 'public',
    caller_access: 'tracking',
    allow_web_service_access: true,
    display: 'order_number',
    auto_number: {
        prefix: 'ORD',
        number: 1000,
        number_of_digits: 7
    }
})
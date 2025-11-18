import '@servicenow/sdk/global'
import { Table, StringColumn, DecimalColumn, ReferenceColumn, BooleanColumn } from '@servicenow/sdk/core'

export const x_1599224_online_d_address = Table({
    name: 'x_1599224_online_d_address',
    label: 'Customer Address',
    schema: {
        customer: ReferenceColumn({
            label: 'Customer',
            referenceTable: 'x_1599224_online_d_customer',
            mandatory: true
        }),
        address_line_1: StringColumn({
            label: 'Address Line 1',
            maxLength: 100,
            mandatory: true
        }),
        address_line_2: StringColumn({
            label: 'Address Line 2',
            maxLength: 100
        }),
        city: StringColumn({
            label: 'City',
            maxLength: 50,
            mandatory: true
        }),
        state: StringColumn({
            label: 'State',
            maxLength: 50,
            mandatory: true
        }),
        zip_code: StringColumn({
            label: 'ZIP Code',
            maxLength: 10,
            mandatory: true
        }),
        country: StringColumn({
            label: 'Country',
            maxLength: 50,
            default: 'United States'
        }),
        latitude: DecimalColumn({
            label: 'Latitude'
        }),
        longitude: DecimalColumn({
            label: 'Longitude'
        }),
        is_default: BooleanColumn({
            label: 'Default Address',
            default: false
        }),
        address_type: StringColumn({
            label: 'Address Type',
            choices: {
                home: { label: 'Home', sequence: 0 },
                work: { label: 'Work', sequence: 1 },
                other: { label: 'Other', sequence: 2 }
            },
            default: 'home',
            dropdown: 'dropdown_with_none'
        })
    },
    actions: ['create', 'read', 'update', 'delete'],
    accessible_from: 'public',
    caller_access: 'tracking',
    allow_web_service_access: true,
    display: 'address_line_1'
})
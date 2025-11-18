import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn, ReferenceColumn, DateTimeColumn } from '@servicenow/sdk/core'

export const x_1599224_online_d_customer = Table({
    name: 'x_1599224_online_d_customer',
    label: 'Customer',
    schema: {
        email: StringColumn({ 
            label: 'Email',
            maxLength: 100,
            mandatory: true 
        }),
        first_name: StringColumn({ 
            label: 'First Name',
            maxLength: 50,
            mandatory: true 
        }),
        last_name: StringColumn({ 
            label: 'Last Name',
            maxLength: 50,
            mandatory: true 
        }),
        phone: StringColumn({ 
            label: 'Phone Number',
            maxLength: 20 
        }),
        user_id: ReferenceColumn({
            label: 'User Account',
            referenceTable: 'sys_user'
        }),
        active: BooleanColumn({
            label: 'Active',
            default: true
        }),
        created_on: DateTimeColumn({
            label: 'Created On',
            read_only: true
        })
    },
    actions: ['create', 'read', 'update', 'delete'],
    accessible_from: 'public',
    caller_access: 'tracking',
    allow_web_service_access: true,
    display: 'email'
})
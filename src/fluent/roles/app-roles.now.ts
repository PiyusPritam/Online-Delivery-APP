import '@servicenow/sdk/global'
import { Role } from '@servicenow/sdk/core'

// Customer role for shopping and ordering
export const customer_role = Role({
    name: 'x_1599224_online_d.customer',
    description: 'Role for customers to browse products, place orders, and manage their profile',
    grantable: true,
    can_delegate: false,
    elevated_privilege: false
})

// Store manager role for store management
export const store_manager_role = Role({
    name: 'x_1599224_online_d.store_manager',
    description: 'Role for store managers to manage products, orders, and view reports',
    grantable: true,
    can_delegate: false,
    elevated_privilege: false,
    contains_roles: [customer_role] // Store managers can also shop as customers
})

// Admin role for full application access
export const delivery_admin_role = Role({
    name: 'x_1599224_online_d.delivery_admin',
    description: 'Full administrative access to the delivery application',
    grantable: true,
    can_delegate: true,
    elevated_privilege: false,
    scoped_admin: true,
    contains_roles: [store_manager_role, customer_role]
})
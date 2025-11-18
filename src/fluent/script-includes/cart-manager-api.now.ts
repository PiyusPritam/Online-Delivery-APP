import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const CartManagerAPI = ScriptInclude({
    $id: Now.ID['CartManagerAPI'],
    name: 'CartManagerAPI',
    apiName: 'x_1599224_online_d.CartManagerAPI',
    description: 'Server-side cart management functionality for the delivery app',
    script: Now.include('../../server/script-includes/cart-manager-api.js'),
    clientCallable: true,
    mobileCallable: true,
    active: true,
    accessibleFrom: 'public',
    callerAccess: 'tracking'
})
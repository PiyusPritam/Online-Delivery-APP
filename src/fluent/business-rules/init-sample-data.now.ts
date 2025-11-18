import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'
import { createSampleProducts } from '../../server/utilities/create-sample-products.js'

BusinessRule({
    $id: Now.ID['init_sample_data_br'],
    name: 'Initialize Sample Products',
    table: 'x_1599224_online_d_product',
    when: 'after',
    action: ['query'],
    script: createSampleProducts,
    order: 1000,
    active: true
})
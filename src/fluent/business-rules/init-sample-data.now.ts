import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'

export const InitSampleData = BusinessRule({
    $id: Now.ID['init_sample_data'],
    name: 'Initialize Sample Data',
    table: 'sys_user',
    when: 'after',
    action: ['insert'],
    script: Now.include('../../server/utilities/create-sample-products.js'),
    order: 1000,
    active: true,
    condition: "current.user_name == 'admin'"
})
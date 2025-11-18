import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import deliveryApp from '../../client/index.html'

export const delivery_app_page = UiPage({
    $id: Now.ID['delivery_app_ui'],
    name: 'delivery_app',
    endpoint: 'x_1599224_online_d_delivery_app.do',
    title: 'FreshCart - Premium Grocery Delivery',
    description: 'FreshCart customer app for ordering fresh groceries and daily essentials',
    category: 'general',
    html: deliveryApp,
    direct: true
})
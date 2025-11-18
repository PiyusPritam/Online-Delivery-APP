import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import deliveryApp from '../../client/index.html'

export const delivery_app_page = UiPage({
    $id: Now.ID['delivery_app_ui'],
    name: 'delivery_app',
    endpoint: 'x_1599224_online_d_delivery_app.do',
    title: 'Online Delivery App',
    description: 'Main delivery application for ordering groceries and products',
    category: 'general',
    html: deliveryApp,
    direct: true
})
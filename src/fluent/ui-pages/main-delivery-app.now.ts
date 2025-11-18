import '@servicenow/sdk/global';
import { UiPage } from '@servicenow/sdk/core';
import mainAppPage from '../../client/main-app.html';

export const main_delivery_app = UiPage({
  $id: Now.ID['main-delivery-app'],
  endpoint: 'x_1599224_online_d_main.do',
  description: 'FreshCart - Your premium grocery delivery app with customer shopping and store management',
  category: 'general',
  html: mainAppPage,
  direct: true
});
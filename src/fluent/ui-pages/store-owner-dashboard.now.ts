import '@servicenow/sdk/global';
import { UiPage } from '@servicenow/sdk/core';
import storeOwnerPage from '../../client/store-owner/index.html';

export const store_owner_dashboard = UiPage({
  $id: Now.ID['store-owner-dashboard'],
  endpoint: 'x_1599224_online_d_store_owner.do',
  description: 'FreshCart Store Dashboard - Manage products, orders, inventory, and view sales analytics',
  category: 'general',
  html: storeOwnerPage,
  direct: true
});
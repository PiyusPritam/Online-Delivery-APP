export class OrderService {
  constructor() {
    this.orderTableName = "x_1599224_online_d_order";
    this.orderItemTableName = "x_1599224_online_d_order_item";
  }

  // Wait for ServiceNow globals
  async waitForGlobals() {
    return new Promise((resolve) => {
      const checkGlobals = () => {
        if (window.g_ck) {
          resolve();
        } else {
          setTimeout(checkGlobals, 100);
        }
      };
      checkGlobals();
    });
  }

  // Enhanced API call with authentication
  async makeAuthenticatedRequest(url, options = {}) {
    await this.waitForGlobals();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-UserToken': window.g_ck || '',
        ...options.headers
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  // Get all orders
  async getOrders(filters = {}) {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('sysparm_display_value', 'all');
      searchParams.set('sysparm_limit', '1000');
      
      // Add ordering by creation date (newest first)
      searchParams.set('sysparm_query', 'ORDERBYDESCsys_created_on');
      
      // Apply filters
      if (filters.status) {
        searchParams.set('sysparm_query', `status=${filters.status}^ORDERBYDESCsys_created_on`);
      }
      
      if (filters.customer) {
        const currentQuery = searchParams.get('sysparm_query');
        searchParams.set('sysparm_query', `${currentQuery}^customerLIKE${filters.customer}`);
      }

      const url = `/api/now/table/${this.orderTableName}?${searchParams.toString()}`;
      console.log('OrderService: Fetching orders from:', url);
      
      const response = await this.makeAuthenticatedRequest(url);
      const data = await response.json();
      
      console.log('OrderService: Orders response:', data);
      return data.result || [];
    } catch (error) {
      console.error('OrderService: Error fetching orders:', error);
      // Return mock orders for demo
      return this.getMockOrders();
    }
  }

  // Get single order by ID
  async getOrder(orderId) {
    try {
      const url = `/api/now/table/${this.orderTableName}/${orderId}?sysparm_display_value=all`;
      const response = await this.makeAuthenticatedRequest(url);
      const data = await response.json();
      
      return data.result;
    } catch (error) {
      console.error('OrderService: Error fetching order:', error);
      return null;
    }
  }

  // Get order with items
  async getOrderWithItems(orderId) {
    try {
      // Get the order
      const order = await this.getOrder(orderId);
      if (!order) {
        return null;
      }

      // Get order items
      const itemsUrl = `/api/now/table/${this.orderItemTableName}?sysparm_query=order=${orderId}&sysparm_display_value=all`;
      const itemsResponse = await this.makeAuthenticatedRequest(itemsUrl);
      const itemsData = await itemsResponse.json();
      
      return {
        ...order,
        items: itemsData.result || []
      };
    } catch (error) {
      console.error('OrderService: Error fetching order with items:', error);
      // Return mock order with items
      return this.getMockOrderWithItems(orderId);
    }
  }

  // Update order status
  async updateOrderStatus(orderId, newStatus) {
    try {
      const url = `/api/now/table/${this.orderTableName}/${orderId}`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          sys_updated_by: 'store_manager',
          sys_updated_on: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      console.log('OrderService: Updated order status:', data);
      return data.result;
    } catch (error) {
      console.error('OrderService: Error updating order status:', error);
      throw error;
    }
  }

  // Create new order (for testing)
  async createOrder(orderData) {
    try {
      const url = `/api/now/table/${this.orderTableName}`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('OrderService: Error creating order:', error);
      throw error;
    }
  }

  // Mock orders for demo purposes
  getMockOrders() {
    const mockOrders = [
      {
        sys_id: 'order_001',
        customer_name: { display_value: 'John Smith' },
        total_amount: { display_value: '45.99' },
        status: { value: 'pending', display_value: 'Pending' },
        sys_created_on: { display_value: new Date().toISOString() },
        item_count: { display_value: '3' },
        delivery_address: { display_value: '123 Main St, City, State 12345' }
      },
      {
        sys_id: 'order_002',
        customer_name: { display_value: 'Sarah Johnson' },
        total_amount: { display_value: '78.45' },
        status: { value: 'confirmed', display_value: 'Confirmed' },
        sys_created_on: { display_value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        item_count: { display_value: '5' },
        delivery_address: { display_value: '456 Oak Ave, City, State 12345' }
      },
      {
        sys_id: 'order_003',
        customer_name: { display_value: 'Mike Brown' },
        total_amount: { display_value: '32.10' },
        status: { value: 'processing', display_value: 'Processing' },
        sys_created_on: { display_value: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        item_count: { display_value: '2' },
        delivery_address: { display_value: '789 Pine St, City, State 12345' }
      },
      {
        sys_id: 'order_004',
        customer_name: { display_value: 'Lisa Davis' },
        total_amount: { display_value: '126.78' },
        status: { value: 'shipped', display_value: 'Shipped' },
        sys_created_on: { display_value: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        item_count: { display_value: '8' },
        delivery_address: { display_value: '321 Elm St, City, State 12345' }
      },
      {
        sys_id: 'order_005',
        customer_name: { display_value: 'Robert Wilson' },
        total_amount: { display_value: '89.55' },
        status: { value: 'delivered', display_value: 'Delivered' },
        sys_created_on: { display_value: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        item_count: { display_value: '4' },
        delivery_address: { display_value: '654 Maple Ave, City, State 12345' }
      }
    ];

    console.log('OrderService: Using mock orders:', mockOrders);
    return mockOrders;
  }

  // Mock order with items for demo
  getMockOrderWithItems(orderId) {
    const mockOrderItems = [
      {
        product_name: { display_value: 'Fresh Red Apples' },
        quantity: { display_value: '2' },
        unit_price: { display_value: '2.99' },
        total_price: { display_value: '5.98' }
      },
      {
        product_name: { display_value: 'Organic Bananas' },
        quantity: { display_value: '1' },
        unit_price: { display_value: '1.89' },
        total_price: { display_value: '1.89' }
      },
      {
        product_name: { display_value: 'Whole Milk' },
        quantity: { display_value: '1' },
        unit_price: { display_value: '4.29' },
        total_price: { display_value: '4.29' }
      }
    ];

    return {
      sys_id: orderId,
      customer_name: { display_value: 'John Smith' },
      total_amount: { display_value: '45.99' },
      status: { value: 'pending', display_value: 'Pending' },
      sys_created_on: { display_value: new Date().toISOString() },
      delivery_address: { display_value: '123 Main St, City, State 12345' },
      items: mockOrderItems
    };
  }

  // Get order statistics
  async getOrderStats() {
    try {
      const orders = await this.getOrders();
      
      const stats = {
        total: orders.length,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      };

      orders.forEach(order => {
        const status = typeof order.status === 'object' ? order.status.value : order.status;
        const amount = typeof order.total_amount === 'object' 
          ? parseFloat(order.total_amount.display_value || 0)
          : parseFloat(order.total_amount || 0);

        stats[status] = (stats[status] || 0) + 1;
        if (status === 'delivered') {
          stats.totalRevenue += amount;
        }
      });

      stats.averageOrderValue = stats.delivered > 0 ? stats.totalRevenue / stats.delivered : 0;

      return stats;
    } catch (error) {
      console.error('OrderService: Error getting order stats:', error);
      return {
        total: 5,
        pending: 1,
        confirmed: 1,
        processing: 1,
        shipped: 1,
        delivered: 1,
        cancelled: 0,
        totalRevenue: 89.55,
        averageOrderValue: 89.55
      };
    }
  }
}
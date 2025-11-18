export class OrderService {
  constructor() {
    this.orderTableName = "x_1599224_online_d_order";
    this.orderItemTableName = "x_1599224_online_d_order_item";
  }

  waitForGlobals() {
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

  async createOrder(orderData, cartItems) {
    try {
      await this.waitForGlobals();
      
      // Create the order first
      const orderResponse = await fetch(`/api/now/table/${this.orderTableName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-UserToken": window.g_ck
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error?.message || 'Failed to create order');
      }

      const { result: order } = await orderResponse.json();
      const orderSysId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;

      // Create order items
      for (const item of cartItems) {
        const productSysId = typeof item.product.sys_id === 'object' 
          ? item.product.sys_id.value 
          : item.product.sys_id;
        const unitPrice = typeof item.product.price === 'object' 
          ? parseFloat(item.product.price.display_value || 0)
          : parseFloat(item.product.price || 0);

        const orderItemData = {
          order: orderSysId,
          product: productSysId,
          quantity: item.quantity,
          unit_price: unitPrice
        };

        await fetch(`/api/now/table/${this.orderItemTableName}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-UserToken": window.g_ck
          },
          body: JSON.stringify(orderItemData),
        });
      }

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrdersByCustomer(customerId) {
    try {
      await this.waitForGlobals();
      
      const response = await fetch(`/api/now/table/${this.orderTableName}?sysparm_query=customer=${customerId}&sysparm_display_value=all&sysparm_order_by=order_date&sysparm_order_direction=desc`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-UserToken": window.g_ck
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const { result } = await response.json();
      return result || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getOrderItems(orderId) {
    try {
      await this.waitForGlobals();
      
      const response = await fetch(`/api/now/table/${this.orderItemTableName}?sysparm_query=order=${orderId}&sysparm_display_value=all`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-UserToken": window.g_ck
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order items');
      }

      const { result } = await response.json();
      return result || [];
    } catch (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status, driverNotes = '') {
    try {
      await this.waitForGlobals();
      
      const updateData = { status };
      if (driverNotes) {
        updateData.driver_notes = driverNotes;
      }
      if (status === 'delivered') {
        updateData.actual_delivery = new Date().toISOString().slice(0, 19).replace('T', ' ');
      }

      const response = await fetch(`/api/now/table/${this.orderTableName}/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-UserToken": window.g_ck
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update order');
      }

      const { result } = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }
}
import React, { useState, useEffect } from 'react';
import { OrderService } from '../services/OrderService.js';

export default function OrderHistory({ currentUser }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  const orderService = new OrderService();

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  const loadOrders = async () => {
    if (!currentUser?.customerProfile) return;

    try {
      setLoading(true);
      const customerSysId = typeof currentUser.customerProfile.sys_id === 'object' 
        ? currentUser.customerProfile.sys_id.value 
        : currentUser.customerProfile.sys_id;
      
      const orderList = await orderService.getOrdersByCustomer(customerSysId);
      setOrders(orderList);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (orderId) => {
    try {
      const items = await orderService.getOrderItems(orderId);
      setOrderItems(items);
    } catch (err) {
      console.error('Error loading order items:', err);
      setOrderItems([]);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    const orderSysId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;
    loadOrderItems(orderSysId);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'preparing': 'status-preparing',
      'out_for_delivery': 'status-delivery',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const dateValue = typeof dateString === 'object' ? dateString.display_value : dateString;
    return new Date(dateValue).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading-spinner">Loading orders...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="no-orders">
        <div className="no-orders-content">
          <div className="no-orders-icon">📋</div>
          <h2>No orders yet</h2>
          <p>Your order history will appear here once you make your first order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h2>Order History</h2>
        <p>View your past orders and track their status</p>
      </div>

      <div className="orders-layout">
        <div className="orders-list">
          {orders.map(order => {
            const orderNumber = typeof order.order_number === 'object' ? order.order_number.display_value : order.order_number;
            const status = typeof order.status === 'object' ? order.status.display_value : order.status;
            const statusValue = typeof order.status === 'object' ? order.status.value : order.status;
            const orderDate = typeof order.order_date === 'object' ? order.order_date.display_value : order.order_date;
            const totalAmount = typeof order.total_amount === 'object' ? order.total_amount.display_value : order.total_amount;

            return (
              <div 
                key={typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id}
                className={`order-card card ${selectedOrder && selectedOrder.sys_id === order.sys_id ? 'selected' : ''}`}
                onClick={() => handleOrderClick(order)}
              >
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{orderNumber}</h3>
                    <p className="order-date">{formatDate(orderDate)}</p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${getStatusBadgeClass(statusValue)}`}>
                      {status}
                    </span>
                  </div>
                </div>
                
                <div className="order-summary">
                  <div className="order-total">
                    <strong>Total: ${parseFloat(totalAmount || 0).toFixed(2)}</strong>
                  </div>
                  <div className="order-arrow">→</div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedOrder && (
          <div className="order-details card">
            <div className="order-details-header">
              <h3>Order Details</h3>
              <button 
                className="btn btn-secondary close-details"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="order-info-section">
              <div className="info-group">
                <label>Order Number:</label>
                <span>{typeof selectedOrder.order_number === 'object' ? selectedOrder.order_number.display_value : selectedOrder.order_number}</span>
              </div>
              
              <div className="info-group">
                <label>Status:</label>
                <span className={`status-badge ${getStatusBadgeClass(typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status)}`}>
                  {typeof selectedOrder.status === 'object' ? selectedOrder.status.display_value : selectedOrder.status}
                </span>
              </div>
              
              <div className="info-group">
                <label>Order Date:</label>
                <span>{formatDate(selectedOrder.order_date)}</span>
              </div>
              
              <div className="info-group">
                <label>Estimated Delivery:</label>
                <span>{formatDate(selectedOrder.estimated_delivery)}</span>
              </div>

              {selectedOrder.actual_delivery && (
                <div className="info-group">
                  <label>Delivered:</label>
                  <span>{formatDate(selectedOrder.actual_delivery)}</span>
                </div>
              )}

              <div className="info-group">
                <label>Payment Method:</label>
                <span>{typeof selectedOrder.payment_method === 'object' ? selectedOrder.payment_method.display_value : selectedOrder.payment_method}</span>
              </div>
            </div>

            <div className="order-items-section">
              <h4>Order Items</h4>
              {orderItems.length === 0 ? (
                <p>Loading items...</p>
              ) : (
                <div className="order-items-list">
                  {orderItems.map((item, index) => {
                    const productName = typeof item.product === 'object' ? item.product.display_value : item.product;
                    const quantity = typeof item.quantity === 'object' ? item.quantity.display_value : item.quantity;
                    const unitPrice = typeof item.unit_price === 'object' ? item.unit_price.display_value : item.unit_price;
                    const totalPrice = typeof item.total_price === 'object' ? item.total_price.display_value : item.total_price;

                    return (
                      <div key={index} className="order-item">
                        <div className="item-name">{productName}</div>
                        <div className="item-details">
                          <span>Qty: {quantity}</span>
                          <span>@ ${parseFloat(unitPrice || 0).toFixed(2)}</span>
                          <strong>${parseFloat(totalPrice || 0).toFixed(2)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="order-total-section">
              <div className="total-breakdown">
                <div className="total-line">
                  <span>Delivery Fee:</span>
                  <span>${parseFloat(typeof selectedOrder.delivery_fee === 'object' ? selectedOrder.delivery_fee.display_value : selectedOrder.delivery_fee || 0).toFixed(2)}</span>
                </div>
                <div className="total-line final-total">
                  <strong>
                    <span>Total:</span>
                    <span>${parseFloat(typeof selectedOrder.total_amount === 'object' ? selectedOrder.total_amount.display_value : selectedOrder.total_amount || 0).toFixed(2)}</span>
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
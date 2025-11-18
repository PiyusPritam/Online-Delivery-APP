import React, { useState, useEffect } from 'react';
import { OrderService } from '../services/OrderService.js';

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const orderService = new OrderService();

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'secondary' },
    { value: 'confirmed', label: 'Confirmed', color: 'info' },
    { value: 'processing', label: 'Processing', color: 'warning' },
    { value: 'shipped', label: 'Shipped', color: 'primary' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'warning' },
    { value: 'delivered', label: 'Delivered', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'danger' }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus, searchTerm]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orderList = await orderService.getOrders();
      setOrders(orderList);
    } catch (error) {
      console.error('Error loading orders:', error);
      showMessage('error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (selectedStatus) {
      filtered = filtered.filter(order => {
        const status = typeof order.status === 'object' ? order.status.value : order.status;
        return status === selectedStatus;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(order => {
        const customerName = typeof order.customer_name === 'object' 
          ? order.customer_name.display_value 
          : order.customer_name || '';
        const orderId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;
        
        return customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               orderId.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredOrders(filtered);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      showMessage('success', 'Order status updated successfully!');
      loadOrders();
      if (selectedOrder && selectedOrder.sys_id === orderId) {
        const updatedOrder = await orderService.getOrder(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showMessage('error', 'Failed to update order status');
    }
  };

  const viewOrderDetails = async (order) => {
    try {
      const orderId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;
      const orderDetails = await orderService.getOrderWithItems(orderId);
      setSelectedOrder(orderDetails);
      setShowOrderDetails(true);
    } catch (error) {
      console.error('Error loading order details:', error);
      showMessage('error', 'Failed to load order details');
    }
  };

  const getStatusInfo = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status) || 
                     { value: status, label: status, color: 'secondary' };
    return statusObj;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h2>Order Management</h2>
        <p>Track and manage customer orders</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          <span>{message.type === 'error' ? '❌' : '✅'}</span>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by customer or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <select
              className="form-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {orderStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <span style={{ color: '#6c757d' }}>
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <h3>Orders</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📋</div>
            <h4>No orders found</h4>
            <p>Orders will appear here when customers place them</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const orderId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;
                  const customerName = typeof order.customer_name === 'object' 
                    ? order.customer_name.display_value 
                    : order.customer_name || 'Unknown Customer';
                  const totalAmount = typeof order.total_amount === 'object' 
                    ? order.total_amount.display_value 
                    : order.total_amount;
                  const status = typeof order.status === 'object' 
                    ? order.status.value 
                    : order.status;
                  const createdOn = typeof order.sys_created_on === 'object' 
                    ? order.sys_created_on.display_value 
                    : order.sys_created_on;
                  const itemCount = typeof order.item_count === 'object'
                    ? order.item_count.display_value
                    : order.item_count || '0';

                  const statusInfo = getStatusInfo(status);
                  const nextStatus = getNextStatus(status);

                  return (
                    <tr key={orderId}>
                      <td style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                        #{orderId.substring(0, 8)}
                      </td>
                      <td>{customerName}</td>
                      <td>{new Date(createdOn).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'center' }}>{itemCount}</td>
                      <td style={{ fontWeight: '600', color: '#007bff' }}>
                        ${parseFloat(totalAmount || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge badge-${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            👁️ View
                          </button>
                          
                          {nextStatus && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => updateOrderStatus(orderId, nextStatus)}
                            >
                              ➡️ {getStatusInfo(nextStatus).label}
                            </button>
                          )}
                          
                          {status !== 'cancelled' && status !== 'delivered' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => updateOrderStatus(orderId, 'cancelled')}
                            >
                              ❌ Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3>Order Details</h3>
              <button
                onClick={() => setShowOrderDetails(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ✕
              </button>
            </div>

            {/* Order Info */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Order ID:</strong><br />
                  <span style={{ fontFamily: 'monospace' }}>
                    #{(typeof selectedOrder.sys_id === 'object' ? selectedOrder.sys_id.value : selectedOrder.sys_id).substring(0, 8)}
                  </span>
                </div>
                <div>
                  <strong>Customer:</strong><br />
                  {typeof selectedOrder.customer_name === 'object' 
                    ? selectedOrder.customer_name.display_value 
                    : selectedOrder.customer_name}
                </div>
                <div>
                  <strong>Date:</strong><br />
                  {new Date(typeof selectedOrder.sys_created_on === 'object' 
                    ? selectedOrder.sys_created_on.display_value 
                    : selectedOrder.sys_created_on).toLocaleString()}
                </div>
                <div>
                  <strong>Status:</strong><br />
                  <span className={`badge badge-${getStatusInfo(typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status).color}`}>
                    {getStatusInfo(typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status).label}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {selectedOrder.delivery_address && (
              <div style={{ marginBottom: '25px' }}>
                <h4>Delivery Address</h4>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                  {typeof selectedOrder.delivery_address === 'object' 
                    ? selectedOrder.delivery_address.display_value 
                    : selectedOrder.delivery_address}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div style={{ marginBottom: '25px' }}>
              <h4>Order Items</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div>
                  {selectedOrder.items.map((item, index) => {
                    const productName = typeof item.product_name === 'object' 
                      ? item.product_name.display_value 
                      : item.product_name;
                    const quantity = typeof item.quantity === 'object' 
                      ? item.quantity.display_value 
                      : item.quantity;
                    const unitPrice = typeof item.unit_price === 'object' 
                      ? item.unit_price.display_value 
                      : item.unit_price;
                    const totalPrice = typeof item.total_price === 'object' 
                      ? item.total_price.display_value 
                      : item.total_price;

                    return (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px',
                        borderBottom: index < selectedOrder.items.length - 1 ? '1px solid #e9ecef' : 'none'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600' }}>{productName}</div>
                          <div style={{ fontSize: '14px', color: '#6c757d' }}>
                            ${parseFloat(unitPrice || 0).toFixed(2)} each
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div>Qty: {quantity}</div>
                          <div style={{ fontWeight: '600', color: '#007bff' }}>
                            ${parseFloat(totalPrice || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: '#6c757d' }}>No items found for this order</p>
              )}
            </div>

            {/* Order Total */}
            <div style={{ 
              borderTop: '2px solid #e9ecef', 
              paddingTop: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <strong style={{ fontSize: '1.2rem' }}>Total Amount:</strong>
              <strong style={{ fontSize: '1.5rem', color: '#007bff' }}>
                ${parseFloat(typeof selectedOrder.total_amount === 'object' 
                  ? selectedOrder.total_amount.display_value 
                  : selectedOrder.total_amount || 0).toFixed(2)}
              </strong>
            </div>

            {/* Status Update Actions */}
            <div style={{ marginTop: '25px' }}>
              <h4>Update Status</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {orderStatuses.map(status => (
                  <button
                    key={status.value}
                    className={`btn btn-${status.color} btn-sm`}
                    onClick={() => {
                      const orderId = typeof selectedOrder.sys_id === 'object' 
                        ? selectedOrder.sys_id.value 
                        : selectedOrder.sys_id;
                      updateOrderStatus(orderId, status.value);
                    }}
                    disabled={status.value === (typeof selectedOrder.status === 'object' 
                      ? selectedOrder.status.value 
                      : selectedOrder.status)}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const orderService = new OrderService();

  // Format price in INR
  const formatPrice = (price) => {
    const numPrice = parseFloat(price || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numPrice);
  };

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: '#f59e0b', emoji: '⏳' },
    { value: 'confirmed', label: 'Confirmed', color: '#3b82f6', emoji: '✅' },
    { value: 'preparing', label: 'Preparing', color: '#8b5cf6', emoji: '👨‍🍳' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: '#06b6d4', emoji: '🚚' },
    { value: 'delivered', label: 'Delivered', color: '#10b981', emoji: '🎉' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444', emoji: '❌' }
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
        const orderNumber = typeof order.order_number === 'object' ? order.order_number.display_value : order.order_number;
        
        return customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (orderNumber && orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }

    // Sort by most recent first
    filtered.sort((a, b) => {
      const dateA = new Date(typeof a.sys_created_on === 'object' ? a.sys_created_on.display_value : a.sys_created_on);
      const dateB = new Date(typeof b.sys_created_on === 'object' ? b.sys_created_on.display_value : b.sys_created_on);
      return dateB - dateA;
    });

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
      if (selectedOrder && (typeof selectedOrder.sys_id === 'object' ? selectedOrder.sys_id.value : selectedOrder.sys_id) === orderId) {
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
    return orderStatuses.find(s => s.value === status) || 
           { value: status, label: status, color: '#6b7280', emoji: '📦' };
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const getStatusCounts = () => {
    return orderStatuses.map(status => ({
      ...status,
      count: orders.filter(order => {
        const orderStatus = typeof order.status === 'object' ? order.status.value : order.status;
        return orderStatus === status.value;
      }).length
    }));
  };

  return (
    <div className="modern-order-manager">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">Order Management</h1>
            <p className="page-subtitle">Track and manage customer orders with real-time updates</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="status-overview">
        {getStatusCounts().map(status => (
          <div 
            key={status.value}
            className={`status-card ${selectedStatus === status.value ? 'selected' : ''}`}
            onClick={() => setSelectedStatus(selectedStatus === status.value ? '' : status.value)}
            style={{ '--status-color': status.color }}
          >
            <div className="status-icon">{status.emoji}</div>
            <div className="status-info">
              <span className="status-count">{status.count}</span>
              <span className="status-label">{status.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`modern-alert ${message.type}`}>
          <div className="alert-icon">
            {message.type === 'error' ? '❌' : '✅'}
          </div>
          <div className="alert-content">{message.text}</div>
          <button className="alert-close" onClick={() => setMessage({ type: '', text: '' })}>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Search and Controls */}
      <div className="controls-section">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by customer name, order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Cards
          </button>
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
            Table
          </button>
        </div>
      </div>

      {/* Orders Display */}
      <div className="orders-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3 className="empty-title">No orders found</h3>
            <p className="empty-text">
              {searchTerm || selectedStatus 
                ? 'Try adjusting your search or filters' 
                : 'Orders will appear here when customers place them'}
            </p>
          </div>
        ) : (
          <div className={`orders-container ${viewMode}`}>
            {filteredOrders.map(order => {
              const orderId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;
              const orderNumber = typeof order.order_number === 'object' ? order.order_number.display_value : order.order_number;
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
              const orderDate = new Date(createdOn);
              const isRecent = (Date.now() - orderDate.getTime()) < 86400000; // 24 hours

              return (
                <div key={orderId} className={`order-card ${status}`}>
                  <div className="order-header">
                    <div className="order-identity">
                      <div className="order-id">
                        #{orderNumber || orderId.substring(0, 8).toUpperCase()}
                        {isRecent && <span className="new-badge">NEW</span>}
                      </div>
                      <div className="customer-name">{customerName}</div>
                    </div>
                    
                    <div className="order-status">
                      <div 
                        className="status-badge"
                        style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
                      >
                        <span className="status-emoji">{statusInfo.emoji}</span>
                        <span className="status-text">{statusInfo.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="order-details">
                      <div className="detail-item">
                        <span className="detail-label">Items</span>
                        <span className="detail-value">{itemCount} products</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Order Date</span>
                        <span className="detail-value">{orderDate.toLocaleDateString('en-IN')}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Order Time</span>
                        <span className="detail-value">{orderDate.toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>

                    <div className="order-amount">
                      <span className="amount-label">Total Amount</span>
                      <span className="amount-value">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      className="action-btn primary"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View Details
                    </button>
                    
                    {nextStatus && (
                      <button
                        className="action-btn success"
                        onClick={() => updateOrderStatus(orderId, nextStatus)}
                      >
                        <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {getStatusInfo(nextStatus).label}
                      </button>
                    )}
                    
                    {status !== 'cancelled' && status !== 'delivered' && (
                      <button
                        className="action-btn danger"
                        onClick={() => updateOrderStatus(orderId, 'cancelled')}
                      >
                        <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title-section">
                <h2 className="modal-title">Order Details</h2>
                <p className="modal-subtitle">
                  #{typeof selectedOrder.order_number === 'object' 
                    ? selectedOrder.order_number.display_value 
                    : selectedOrder.order_number || 
                      (typeof selectedOrder.sys_id === 'object' 
                        ? selectedOrder.sys_id.value 
                        : selectedOrder.sys_id).substring(0, 8).toUpperCase()}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowOrderDetails(false)}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {/* Order Summary */}
              <div className="order-summary-section">
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Customer</span>
                    <span className="summary-value">
                      {typeof selectedOrder.customer_name === 'object' 
                        ? selectedOrder.customer_name.display_value 
                        : selectedOrder.customer_name}
                    </span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="summary-label">Order Date</span>
                    <span className="summary-value">
                      {new Date(typeof selectedOrder.sys_created_on === 'object' 
                        ? selectedOrder.sys_created_on.display_value 
                        : selectedOrder.sys_created_on).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="summary-label">Payment Method</span>
                    <span className="summary-value">
                      {typeof selectedOrder.payment_method === 'object' 
                        ? selectedOrder.payment_method.display_value 
                        : selectedOrder.payment_method || 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="summary-label">Current Status</span>
                    <div 
                      className="status-badge large"
                      style={{ 
                        backgroundColor: `${getStatusInfo(typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status).color}20`, 
                        color: getStatusInfo(typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status).color 
                      }}
                    >
                      <span>{getStatusInfo(typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status).emoji}</span>
                      <span>{getStatusInfo(typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status).label}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.delivery_address && (
                <div className="address-section">
                  <h4 className="section-title">Delivery Address</h4>
                  <div className="address-card">
                    <div className="address-icon">📍</div>
                    <div className="address-text">
                      {typeof selectedOrder.delivery_address === 'object' 
                        ? selectedOrder.delivery_address.display_value 
                        : selectedOrder.delivery_address}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="items-section">
                <h4 className="section-title">
                  Order Items ({selectedOrder.items ? selectedOrder.items.length : 0})
                </h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="items-list">
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
                        <div key={index} className="item-row">
                          <div className="item-info">
                            <span className="item-name">{productName}</span>
                            <span className="item-price">{formatPrice(unitPrice)} each</span>
                          </div>
                          <div className="item-quantity">
                            <span className="quantity-badge">×{quantity}</span>
                          </div>
                          <div className="item-total">
                            <span className="total-price">{formatPrice(totalPrice)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-items">
                    <p>No items found for this order</p>
                  </div>
                )}
              </div>

              {/* Order Total */}
              <div className="total-section">
                <div className="total-row">
                  <span className="total-label">Total Amount</span>
                  <span className="total-amount">
                    {formatPrice(typeof selectedOrder.total_amount === 'object' 
                      ? selectedOrder.total_amount.display_value 
                      : selectedOrder.total_amount || 0)}
                  </span>
                </div>
              </div>

              {/* Quick Status Updates */}
              <div className="quick-actions-section">
                <h4 className="section-title">Quick Status Update</h4>
                <div className="quick-actions">
                  {orderStatuses
                    .filter(s => s.value !== status)
                    .map(statusOption => (
                      <button
                        key={statusOption.value}
                        className="quick-action-btn"
                        style={{ borderColor: statusOption.color, color: statusOption.color }}
                        onClick={() => {
                          const orderId = typeof selectedOrder.sys_id === 'object' 
                            ? selectedOrder.sys_id.value 
                            : selectedOrder.sys_id;
                          updateOrderStatus(orderId, statusOption.value);
                        }}
                      >
                        <span className="action-emoji">{statusOption.emoji}</span>
                        <span>Mark as {statusOption.label}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modern-order-manager {
          background: #f8fafc;
          min-height: 100vh;
        }

        .page-header {
          background: white;
          padding: 32px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 24px;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .page-subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 1rem;
        }

        .header-stats {
          display: flex;
          gap: 16px;
        }

        .stat-card {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1d4ed8;
          padding: 16px 20px;
          border-radius: 12px;
          text-align: center;
          min-width: 120px;
        }

        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          opacity: 0.8;
        }

        .status-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .status-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .status-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .status-card.selected {
          border-color: var(--status-color);
          background: color-mix(in srgb, var(--status-color) 5%, white);
        }

        .status-icon {
          font-size: 2rem;
          margin-bottom: 8px;
          display: block;
        }

        .status-count {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
          color: #1f2937;
        }

        .status-label {
          display: block;
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .modern-alert {
          margin-bottom: 24px;
          padding: 16px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          position: relative;
        }

        .modern-alert.error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .modern-alert.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .alert-icon {
          font-size: 1.25rem;
        }

        .alert-content {
          flex: 1;
        }

        .alert-close {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .alert-close:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .alert-close svg {
          width: 16px;
          height: 16px;
        }

        .controls-section {
          background: white;
          padding: 24px 32px;
          border-radius: 16px;
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          background: #f9fafb;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .view-controls {
          display: flex;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 2px;
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
        }

        .view-btn.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .view-btn svg {
          width: 14px;
          height: 14px;
        }

        .orders-section {
          background: white;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .loading-state,
        .empty-state {
          padding: 80px 32px;
          text-align: center;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        .loading-text {
          color: #6b7280;
          font-size: 1.125rem;
          font-weight: 500;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 24px;
          opacity: 0.5;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .empty-text {
          color: #6b7280;
          margin: 0;
        }

        .orders-container {
          padding: 32px;
        }

        .orders-container.cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }

        .order-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
        }

        .order-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: #e5e7eb;
        }

        .order-card.pending::before { background: #f59e0b; }
        .order-card.confirmed::before { background: #3b82f6; }
        .order-card.preparing::before { background: #8b5cf6; }
        .order-card.out_for_delivery::before { background: #06b6d4; }
        .order-card.delivered::before { background: #10b981; }
        .order-card.cancelled::before { background: #ef4444; }

        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .order-header {
          padding: 20px 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .order-identity {
          flex: 1;
        }

        .order-id {
          font-size: 1rem;
          font-weight: 700;
          color: #1f2937;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .new-badge {
          background: #10b981;
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .customer-name {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.large {
          padding: 8px 16px;
          font-size: 14px;
        }

        .status-emoji {
          font-size: 14px;
        }

        .order-body {
          padding: 20px 24px;
        }

        .order-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .detail-item {
          text-align: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .detail-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .detail-value {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
        }

        .order-amount {
          text-align: center;
          padding: 16px;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 12px;
          border: 1px solid #bae6fd;
        }

        .amount-label {
          display: block;
          font-size: 12px;
          color: #0369a1;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .amount-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 800;
          color: #0c4a6e;
        }

        .order-actions {
          padding: 0 24px 24px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.primary {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .action-btn.primary:hover {
          background: #bfdbfe;
        }

        .action-btn.success {
          background: #d1fae5;
          color: #065f46;
        }

        .action-btn.success:hover {
          background: #a7f3d0;
        }

        .action-btn.danger {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-btn.danger:hover {
          background: #fecaca;
        }

        .action-icon {
          width: 12px;
          height: 12px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 32px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .modal-subtitle {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
          font-family: 'JetBrains Mono', monospace;
        }

        .modal-close {
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .modal-close:hover {
          background: #e5e7eb;
        }

        .modal-close svg {
          width: 16px;
          height: 16px;
          color: #374151;
        }

        .modal-body {
          padding: 32px;
        }

        .order-summary-section {
          margin-bottom: 32px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .summary-item {
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          text-align: center;
        }

        .summary-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .summary-value {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #1f2937;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 16px 0;
        }

        .address-section {
          margin-bottom: 32px;
        }

        .address-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .address-icon {
          font-size: 1.25rem;
          margin-top: 2px;
        }

        .address-text {
          flex: 1;
          color: #374151;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .items-section {
          margin-bottom: 32px;
        }

        .items-list {
          background: #f8fafc;
          border-radius: 12px;
          overflow: hidden;
        }

        .item-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 16px;
          padding: 16px 20px;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }

        .item-row:last-child {
          border-bottom: none;
        }

        .item-info {
          flex: 1;
        }

        .item-name {
          display: block;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .item-price {
          font-size: 13px;
          color: #6b7280;
        }

        .quantity-badge {
          background: #dbeafe;
          color: #1d4ed8;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .total-price {
          font-size: 14px;
          font-weight: 700;
          color: #059669;
        }

        .no-items {
          padding: 40px;
          text-align: center;
          color: #6b7280;
        }

        .total-section {
          margin-bottom: 32px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          border-radius: 12px;
        }

        .total-label {
          font-size: 1.125rem;
          font-weight: 700;
          color: #065f46;
        }

        .total-amount {
          font-size: 1.5rem;
          font-weight: 800;
          color: #047857;
        }

        .quick-actions-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 24px;
        }

        .quick-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: white;
          border: 2px solid;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-action-btn:hover {
          background: color-mix(in srgb, currentColor 5%, white);
        }

        .action-emoji {
          font-size: 14px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .orders-container.cards {
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .page-header,
          .controls-section,
          .orders-container {
            padding: 20px;
          }
          
          .controls-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            min-width: auto;
          }
          
          .orders-container.cards {
            grid-template-columns: 1fr;
          }
          
          .order-details {
            grid-template-columns: 1fr 1fr;
          }
          
          .item-row {
            grid-template-columns: 1fr;
            gap: 8px;
            text-align: center;
          }
          
          .modal-content {
            margin: 20px;
            max-height: calc(100vh - 40px);
          }
          
          .modal-body {
            padding: 20px;
          }
          
          .summary-grid {
            grid-template-columns: 1fr;
          }
          
          .quick-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
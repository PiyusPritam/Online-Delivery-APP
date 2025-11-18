/* Enhanced Order Tracking Component */
import React, { useState, useEffect } from 'react';
import { OrderService } from '../services/OrderService.js';

export default function OrderTracking({ currentUser }) {
  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const orderService = new OrderService();

  useEffect(() => {
    loadActiveOrders();
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      loadActiveOrders();
      setLastUpdated(new Date());
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [currentUser]);

  const loadActiveOrders = async () => {
    if (!currentUser?.customerProfile) return;

    try {
      setLoading(true);
      const customerSysId = typeof currentUser.customerProfile.sys_id === 'object' 
        ? currentUser.customerProfile.sys_id.value 
        : currentUser.customerProfile.sys_id;
      
      const orders = await orderService.getOrdersByCustomer(customerSysId);
      
      // Filter for active orders (not delivered or cancelled)
      const active = orders.filter(order => {
        const status = typeof order.status === 'object' ? order.status.value : order.status;
        return !['delivered', 'cancelled'].includes(status);
      });
      
      setActiveOrders(active);
      
      // Auto-select first active order if none selected or if selected order is no longer active
      if (!selectedOrder || !active.find(o => {
        const oId = typeof o.sys_id === 'object' ? o.sys_id.value : o.sys_id;
        const sId = typeof selectedOrder.sys_id === 'object' ? selectedOrder.sys_id.value : selectedOrder.sys_id;
        return oId === sId;
      })) {
        setSelectedOrder(active.length > 0 ? active[0] : null);
      }
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (status) => {
    const statusMap = {
      'pending': { progress: 20, step: 1, text: 'Order Received', color: '#f59e0b' },
      'confirmed': { progress: 40, step: 2, text: 'Order Confirmed', color: '#3b82f6' },
      'preparing': { progress: 60, step: 3, text: 'Preparing Order', color: '#8b5cf6' },
      'out_for_delivery': { progress: 80, step: 4, text: 'Out for Delivery', color: '#06b6d4' },
      'delivered': { progress: 100, step: 5, text: 'Delivered', color: '#10b981' }
    };
    return statusMap[status] || { progress: 0, step: 0, text: 'Unknown', color: '#6b7280' };
  };

  const getStatusIcon = (status) => {
    const statusMap = {
      'pending': '⏳',
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'out_for_delivery': '🚚',
      'delivered': '📦'
    };
    return statusMap[status] || '📋';
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numPrice);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const dateValue = typeof dateString === 'object' ? dateString.display_value : dateString;
    return new Date(dateValue).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDeliveryTime = (order) => {
    const status = typeof order.status === 'object' ? order.status.value : order.status;
    const orderDate = new Date(typeof order.order_date === 'object' ? order.order_date.display_value : order.order_date);
    
    let minutesToAdd;
    switch (status) {
      case 'pending':
        minutesToAdd = 25;
        break;
      case 'confirmed':
        minutesToAdd = 20;
        break;
      case 'preparing':
        minutesToAdd = 15;
        break;
      case 'out_for_delivery':
        minutesToAdd = 10;
        break;
      default:
        minutesToAdd = 30;
    }
    
    const estimatedTime = new Date(orderDate.getTime() + (minutesToAdd * 60000));
    return estimatedTime;
  };

  if (loading) {
    return (
      <div className="modern-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h3>Loading tracking information...</h3>
          <p>Please wait while we fetch your order status</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Unable to load tracking</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadActiveOrders}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (activeOrders.length === 0) {
    return (
      <div className="modern-empty">
        <div className="empty-content">
          <div className="empty-icon">📍</div>
          <h2 className="empty-title">No active orders to track</h2>
          <p className="empty-subtitle">Place an order to see real-time tracking information here.</p>
          <div className="empty-suggestions">
            <div className="suggestion-card">
              <span className="suggestion-icon">🛒</span>
              <span>Start shopping to track your orders</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-order-tracking">
      {/* Header */}
      <div className="tracking-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Order Tracking</h1>
            <p className="page-subtitle">Track your active orders in real-time</p>
          </div>
          <div className="header-status">
            <div className="live-indicator">
              <div className="live-dot"></div>
              <span>Live Tracking</span>
            </div>
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="tracking-layout">
        {/* Active Orders Sidebar */}
        <div className="orders-sidebar">
          <div className="sidebar-header">
            <h3>Active Orders ({activeOrders.length})</h3>
          </div>
          
          <div className="orders-list">
            {activeOrders.map(order => {
              const orderNumber = typeof order.order_number === 'object' ? order.order_number.display_value : order.order_number;
              const status = typeof order.status === 'object' ? order.status.display_value : order.status;
              const statusValue = typeof order.status === 'object' ? order.status.value : order.status;
              const orderSysId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;
              const selectedSysId = typeof selectedOrder?.sys_id === 'object' ? selectedOrder.sys_id.value : selectedOrder?.sys_id;
              const statusProgress = getStatusProgress(statusValue);
              const estimatedTime = getEstimatedDeliveryTime(order);

              return (
                <div 
                  key={orderSysId}
                  className={`order-card ${orderSysId === selectedSysId ? 'selected' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="card-header">
                    <div className="order-number">#{orderNumber}</div>
                    <div className="order-status">
                      <span className="status-icon">{getStatusIcon(statusValue)}</span>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="status-text">{status}</div>
                    <div className="estimated-time">
                      ETA: {estimatedTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${statusProgress.progress}%`,
                        backgroundColor: statusProgress.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Tracking Display */}
        <div className="tracking-main">
          {selectedOrder && (
            <>
              {/* Order Info Card */}
              <div className="tracking-card order-info-card">
                <div className="card-header">
                  <h3>Order #{typeof selectedOrder.order_number === 'object' ? selectedOrder.order_number.display_value : selectedOrder.order_number}</h3>
                  <div className="order-amount">
                    {formatPrice(typeof selectedOrder.total_amount === 'object' ? selectedOrder.total_amount.display_value : selectedOrder.total_amount)}
                  </div>
                </div>
                
                <div className="order-details-grid">
                  <div className="detail-item">
                    <div className="detail-icon">📅</div>
                    <div className="detail-content">
                      <span className="detail-label">Order Date</span>
                      <span className="detail-value">{formatDate(selectedOrder.order_date)}</span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">💳</div>
                    <div className="detail-content">
                      <span className="detail-label">Payment</span>
                      <span className="detail-value">
                        {typeof selectedOrder.payment_method === 'object' ? selectedOrder.payment_method.display_value : selectedOrder.payment_method}
                      </span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">🏠</div>
                    <div className="detail-content">
                      <span className="detail-label">Delivery Address</span>
                      <span className="detail-value">
                        {typeof selectedOrder.delivery_address === 'object' ? selectedOrder.delivery_address.display_value : selectedOrder.delivery_address}
                      </span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">⏰</div>
                    <div className="detail-content">
                      <span className="detail-label">Estimated Delivery</span>
                      <span className="detail-value">
                        {getEstimatedDeliveryTime(selectedOrder).toLocaleString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="tracking-card progress-card">
                <div className="card-header">
                  <h4>Order Progress</h4>
                  <div className="progress-percentage">
                    {getStatusProgress(typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status).progress}%
                  </div>
                </div>
                <TrackingProgress 
                  status={typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status} 
                />
              </div>

              {/* Delivery Map */}
              <div className="tracking-card map-card">
                <div className="card-header">
                  <h4>Live Delivery Tracking</h4>
                  <div className="map-controls">
                    <button className="map-btn refresh" onClick={loadActiveOrders}>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>
                <DeliveryMap 
                  order={selectedOrder}
                  status={typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status}
                />
              </div>

              {/* Driver/Delivery Info */}
              {(typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status) === 'out_for_delivery' && (
                <div className="tracking-card driver-card">
                  <div className="card-header">
                    <h4>Delivery Partner</h4>
                    <div className="driver-status">
                      <div className="status-dot active"></div>
                      <span>On the way</span>
                    </div>
                  </div>
                  
                  <div className="driver-info">
                    <div className="driver-avatar">
                      <span>🚴‍♂️</span>
                    </div>
                    <div className="driver-details">
                      <div className="driver-name">Delivery Partner</div>
                      <div className="driver-meta">
                        <span>⭐ 4.8 Rating</span>
                        <span>🚚 Express Delivery</span>
                      </div>
                    </div>
                    <div className="driver-actions">
                      <button className="contact-btn">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a.678.678 0 01.659.562l.83 4.982a.678.678 0 01-.122.58L5.6 8.8a13.97 13.97 0 005.6 5.6l.676-.92a.678.678 0 01.58-.122l4.982.83a.678.678 0 01.562.659V17a1 1 0 01-1 1h-2C7.832 18 2 12.168 2 5V3z"/>
                        </svg>
                        Call
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions/Notes */}
              {selectedOrder.delivery_instructions && (
                <div className="tracking-card notes-card">
                  <div className="card-header">
                    <h4>Delivery Instructions</h4>
                  </div>
                  <div className="notes-content">
                    <div className="note-icon">📝</div>
                    <p>{typeof selectedOrder.delivery_instructions === 'object' ? selectedOrder.delivery_instructions.display_value : selectedOrder.delivery_instructions}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .modern-order-tracking {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 24px 20px;
        }

        /* Loading & Error States */
        .modern-loading,
        .modern-error,
        .modern-empty {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-content,
        .error-content,
        .empty-content {
          text-align: center;
          max-width: 400px;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon,
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .empty-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 12px 0;
        }

        .empty-subtitle {
          color: #6b7280;
          margin: 0 0 32px 0;
          font-size: 1.125rem;
        }

        .suggestion-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          font-weight: 500;
          color: #374151;
        }

        .suggestion-icon {
          font-size: 1.5rem;
        }

        .retry-btn {
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .retry-btn:hover {
          background: #2563eb;
        }

        /* Header */
        .tracking-header {
          max-width: 1400px;
          margin: 0 auto 32px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .page-subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 1.125rem;
        }

        .header-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          font-weight: 600;
          color: #059669;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }

        .last-updated {
          color: #6b7280;
          font-size: 0.875rem;
        }

        /* Layout */
        .tracking-layout {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 32px;
          align-items: start;
        }

        /* Orders Sidebar */
        .orders-sidebar {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          position: sticky;
          top: 20px;
        }

        .sidebar-header {
          padding: 24px 24px 0;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 20px;
        }

        .sidebar-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .orders-list {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .order-card {
          padding: 20px;
          border: 2px solid transparent;
          border-radius: 16px;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .order-card:hover {
          background: #f1f5f9;
          transform: translateY(-2px);
        }

        .order-card.selected {
          background: #eff6ff;
          border-color: #3b82f6;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
        }

        .order-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .order-number {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
        }

        .order-status .status-icon {
          font-size: 1.5rem;
        }

        .order-card .card-body {
          margin-bottom: 16px;
        }

        .status-text {
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }

        .estimated-time {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .progress-bar {
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        /* Main Tracking Area */
        .tracking-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .tracking-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }

        .tracking-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f3f4f6;
        }

        .tracking-card .card-header h3,
        .tracking-card .card-header h4 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .tracking-card .card-header h4 {
          font-size: 1.25rem;
        }

        /* Order Info Card */
        .order-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #059669;
        }

        .order-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .detail-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 10px;
        }

        .detail-content {
          flex: 1;
        }

        .detail-label {
          display: block;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 4px;
        }

        .detail-value {
          font-weight: 600;
          color: #1f2937;
        }

        /* Progress Card */
        .progress-percentage {
          font-size: 1.25rem;
          font-weight: 700;
          color: #3b82f6;
        }

        /* Map Card */
        .map-controls {
          display: flex;
          gap: 12px;
        }

        .map-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .map-btn:hover {
          background: #e5e7eb;
        }

        .map-btn svg {
          width: 16px;
          height: 16px;
        }

        /* Driver Card */
        .driver-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #059669;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6b7280;
        }

        .status-dot.active {
          background: #10b981;
        }

        .driver-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .driver-avatar {
          width: 60px;
          height: 60px;
          background: #f0f9ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .driver-details {
          flex: 1;
        }

        .driver-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .driver-meta {
          display: flex;
          gap: 16px;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .contact-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .contact-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .contact-btn svg {
          width: 16px;
          height: 16px;
        }

        /* Notes Card */
        .notes-content {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .note-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f9ff;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .notes-content p {
          margin: 0;
          color: #374151;
          line-height: 1.6;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .tracking-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .orders-sidebar {
            position: static;
          }
          
          .orders-list {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 16px;
          }
          
          .order-card {
            min-width: 250px;
            flex-shrink: 0;
          }
        }

        @media (max-width: 768px) {
          .modern-order-tracking {
            padding: 16px 12px;
          }
          
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }
          
          .header-status {
            align-items: stretch;
          }
          
          .order-details-grid {
            grid-template-columns: 1fr;
          }
          
          .orders-list {
            flex-direction: column;
            padding-bottom: 24px;
          }
          
          .order-card {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}

// Enhanced Progress Tracking Component
function TrackingProgress({ status }) {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: '📋', description: 'We received your order' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅', description: 'Order confirmed and processing' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', description: 'Your order is being prepared' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚', description: 'On the way to you' },
    { key: 'delivered', label: 'Delivered', icon: '🏠', description: 'Order delivered successfully' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);
  const statusProgress = getStatusProgress(status);

  return (
    <div className="progress-tracker">
      <div className="progress-timeline">
        {steps.map((step, index) => (
          <div 
            key={step.key} 
            className={`timeline-step ${index <= currentStepIndex ? 'completed' : ''} ${index === currentStepIndex ? 'current' : ''}`}
          >
            <div className="step-connector" />
            <div className="step-marker">
              <div className="step-icon">{step.icon}</div>
            </div>
            <div className="step-content">
              <div className="step-title">{step.label}</div>
              <div className="step-description">{step.description}</div>
              {index === currentStepIndex && (
                <div className="step-timestamp">
                  In progress...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced Delivery Map Component
function DeliveryMap({ order, status }) {
  const [driverPosition, setDriverPosition] = useState({ x: 10, y: 10 });
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Simulate driver movement based on order status
    const positions = {
      'pending': { x: 10, y: 10 },
      'confirmed': { x: 20, y: 15 },
      'preparing': { x: 30, y: 20 },
      'out_for_delivery': { x: 60, y: 70 },
      'delivered': { x: 80, y: 85 }
    };

    const targetPosition = positions[status] || { x: 10, y: 10 };
    
    if (targetPosition.x !== driverPosition.x || targetPosition.y !== driverPosition.y) {
      setAnimating(true);
      
      // Animate to new position
      const animationDuration = 2000; // 2 seconds
      const startTime = Date.now();
      const startPosition = driverPosition;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        const newPosition = {
          x: startPosition.x + (targetPosition.x - startPosition.x) * easeProgress,
          y: startPosition.y + (targetPosition.y - startPosition.y) * easeProgress
        };
        
        setDriverPosition(newPosition);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimating(false);
        }
      };

      animate();
    }
  }, [status]);

  const deliveryAddress = typeof order.delivery_address === 'object' 
    ? order.delivery_address.display_value 
    : order.delivery_address;

  return (
    <div className="enhanced-map">
      <div className="map-info-bar">
        <div className="address-info">
          <div className="address-icon">📍</div>
          <div className="address-details">
            <div className="address-label">Delivery Address</div>
            <div className="address-text">{deliveryAddress}</div>
          </div>
        </div>
        <div className="distance-info">
          <div className="distance-value">2.3 km</div>
          <div className="distance-label">Distance</div>
        </div>
      </div>
      
      <div className="map-container">
        <div className="map-background">
          {/* Store location */}
          <div className="map-location store" style={{ left: '10%', top: '10%' }}>
            <div className="location-marker store-marker">
              <div className="marker-icon">🏪</div>
              <div className="marker-pulse"></div>
            </div>
            <div className="location-label">FreshCart Store</div>
          </div>
          
          {/* Delivery location */}
          <div className="map-location delivery" style={{ left: '80%', top: '85%' }}>
            <div className="location-marker delivery-marker">
              <div className="marker-icon">🏠</div>
              <div className="marker-pulse"></div>
            </div>
            <div className="location-label">Your Address</div>
          </div>
          
          {/* Driver position */}
          {(status === 'out_for_delivery' || status === 'preparing') && (
            <div 
              className={`map-location driver ${animating ? 'moving' : ''}`}
              style={{ left: `${driverPosition.x}%`, top: `${driverPosition.y}%` }}
            >
              <div className="location-marker driver-marker">
                <div className="marker-icon">🚚</div>
                <div className="marker-pulse"></div>
              </div>
              <div className="location-label">Delivery Partner</div>
            </div>
          )}
          
          {/* Route line */}
          <svg className="route-path" width="100%" height="100%">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8"/>
              </linearGradient>
            </defs>
            <line 
              x1="10%" y1="10%" 
              x2="80%" y2="85%" 
              stroke="url(#routeGradient)" 
              strokeWidth="3" 
              strokeDasharray="10,5"
              className="route-line"
            />
          </svg>
          
          {/* Background grid */}
          <div className="map-grid"></div>
        </div>
        
        <div className="map-status-overlay">
          <div className="status-card">
            {status === 'out_for_delivery' ? (
              <>
                <div className="status-icon">🚚</div>
                <div className="status-text">
                  <div className="status-title">On the way!</div>
                  <div className="status-subtitle">Your order will arrive soon</div>
                </div>
              </>
            ) : status === 'preparing' ? (
              <>
                <div className="status-icon">👨‍🍳</div>
                <div className="status-text">
                  <div className="status-title">Being prepared</div>
                  <div className="status-subtitle">Your order is being carefully prepared</div>
                </div>
              </>
            ) : status === 'delivered' ? (
              <>
                <div className="status-icon">✅</div>
                <div className="status-text">
                  <div className="status-title">Delivered!</div>
                  <div className="status-subtitle">Your order has been delivered successfully</div>
                </div>
              </>
            ) : (
              <>
                <div className="status-icon">📋</div>
                <div className="status-text">
                  <div className="status-title">Processing</div>
                  <div className="status-subtitle">We're getting your order ready</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .enhanced-map {
          background: #f8fafc;
          border-radius: 16px;
          overflow: hidden;
        }

        .map-info-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .address-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .address-icon {
          font-size: 1.25rem;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          border-radius: 8px;
        }

        .address-label {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 2px;
        }

        .address-text {
          font-weight: 600;
          color: #1f2937;
        }

        .distance-info {
          text-align: right;
        }

        .distance-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #3b82f6;
        }

        .distance-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .map-container {
          position: relative;
          height: 300px;
          background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%);
        }

        .map-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .map-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .map-location {
          position: absolute;
          transform: translate(-50%, -50%);
          z-index: 10;
        }

        .location-marker {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .location-marker:hover {
          transform: scale(1.1);
        }

        .store-marker {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .delivery-marker {
          background: linear-gradient(135deg, #10b981, #047857);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .driver-marker {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
          animation: driverBounce 2s ease-in-out infinite;
        }

        @keyframes driverBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .marker-icon {
          font-size: 1.25rem;
        }

        .marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: inherit;
          transform: translate(-50%, -50%);
          animation: markerPulse 2s ease-in-out infinite;
          opacity: 0.6;
        }

        @keyframes markerPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }

        .location-label {
          background: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #374151;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          white-space: nowrap;
        }

        .driver.moving .location-marker {
          animation: driverBounce 2s ease-in-out infinite, driverMove 2s ease-out;
        }

        @keyframes driverMove {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .route-path {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }

        .route-line {
          animation: routeFlow 3s linear infinite;
        }

        @keyframes routeFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 30; }
        }

        .map-status-overlay {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          z-index: 20;
        }

        .status-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          padding: 16px 20px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
        }

        .status-card .status-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f9ff;
          border-radius: 10px;
        }

        .status-title {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .status-subtitle {
          color: #6b7280;
          font-size: 0.875rem;
        }

        /* Progress Tracker Styles */
        .progress-tracker {
          padding: 8px 0;
        }

        .progress-timeline {
          position: relative;
        }

        .timeline-step {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 32px;
          position: relative;
        }

        .timeline-step:last-child {
          margin-bottom: 0;
        }

        .step-connector {
          position: absolute;
          left: 20px;
          top: 40px;
          bottom: -32px;
          width: 2px;
          background: #e5e7eb;
          z-index: 1;
        }

        .timeline-step.completed .step-connector {
          background: #10b981;
        }

        .timeline-step:last-child .step-connector {
          display: none;
        }

        .step-marker {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f3f4f6;
          border: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          z-index: 2;
          transition: all 0.3s ease;
        }

        .timeline-step.completed .step-marker {
          background: #d1fae5;
          border-color: #10b981;
        }

        .timeline-step.current .step-marker {
          background: #eff6ff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          animation: currentPulse 2s ease-in-out infinite;
        }

        @keyframes currentPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.05); }
        }

        .step-icon {
          font-size: 1.125rem;
        }

        .step-content {
          flex: 1;
          padding-top: 4px;
        }

        .step-title {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .step-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 4px;
        }

        .step-timestamp {
          color: #3b82f6;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .timeline-step.completed .step-title,
        .timeline-step.completed .step-description {
          color: #059669;
        }

        .timeline-step.current .step-title {
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
}

function getStatusProgress(status) {
  const statusMap = {
    'pending': { progress: 20 },
    'confirmed': { progress: 40 },
    'preparing': { progress: 60 },
    'out_for_delivery': { progress: 80 },
    'delivered': { progress: 100 }
  };
  return statusMap[status] || { progress: 0 };
}
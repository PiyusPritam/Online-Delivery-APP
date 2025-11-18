import React, { useState, useEffect } from 'react';
import { OrderService } from '../services/OrderService.js';

export default function OrderTracking({ currentUser }) {
  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orderService = new OrderService();

  useEffect(() => {
    loadActiveOrders();
    // Set up polling for real-time updates
    const interval = setInterval(loadActiveOrders, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [currentUser]);

  const loadActiveOrders = async () => {
    if (!currentUser?.customerProfile) return;

    try {
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
      
      // Auto-select first active order if none selected
      if (!selectedOrder && active.length > 0) {
        setSelectedOrder(active[0]);
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
      'pending': { progress: 20, step: 1, text: 'Order Received' },
      'confirmed': { progress: 40, step: 2, text: 'Order Confirmed' },
      'preparing': { progress: 60, step: 3, text: 'Preparing Order' },
      'out_for_delivery': { progress: 80, step: 4, text: 'Out for Delivery' },
      'delivered': { progress: 100, step: 5, text: 'Delivered' }
    };
    return statusMap[status] || { progress: 0, step: 0, text: 'Unknown' };
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

  if (loading) {
    return <div className="loading-spinner">Loading tracking information...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (activeOrders.length === 0) {
    return (
      <div className="no-tracking">
        <div className="no-tracking-content">
          <div className="no-tracking-icon">📍</div>
          <h2>No active orders to track</h2>
          <p>Place an order to see real-time tracking information here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-container">
      <div className="tracking-header">
        <h2>Order Tracking</h2>
        <p>Track your active orders in real-time</p>
      </div>

      <div className="tracking-layout">
        {/* Order Selection Sidebar */}
        <div className="tracking-sidebar">
          <h3>Active Orders</h3>
          {activeOrders.map(order => {
            const orderNumber = typeof order.order_number === 'object' ? order.order_number.display_value : order.order_number;
            const status = typeof order.status === 'object' ? order.status.display_value : order.status;
            const orderSysId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;
            const selectedSysId = typeof selectedOrder?.sys_id === 'object' ? selectedOrder.sys_id.value : selectedOrder?.sys_id;

            return (
              <div 
                key={orderSysId}
                className={`tracking-order-card ${orderSysId === selectedSysId ? 'selected' : ''}`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="order-number">#{orderNumber}</div>
                <div className="order-status">{status}</div>
                <div className="order-time">
                  {formatDate(order.estimated_delivery)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Tracking Display */}
        <div className="tracking-main">
          {selectedOrder && (
            <>
              {/* Order Info */}
              <div className="tracking-order-info card">
                <h3>Order #{typeof selectedOrder.order_number === 'object' ? selectedOrder.order_number.display_value : selectedOrder.order_number}</h3>
                <div className="order-details-grid">
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className="status-text">
                      {typeof selectedOrder.status === 'object' ? selectedOrder.status.display_value : selectedOrder.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Estimated Delivery:</label>
                    <span>{formatDate(selectedOrder.estimated_delivery)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total:</label>
                    <span>${parseFloat(typeof selectedOrder.total_amount === 'object' ? selectedOrder.total_amount.display_value : selectedOrder.total_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Payment:</label>
                    <span>{typeof selectedOrder.payment_method === 'object' ? selectedOrder.payment_method.display_value : selectedOrder.payment_method}</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="progress-tracker card">
                <h4>Order Progress</h4>
                <TrackingProgress 
                  status={typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status} 
                />
              </div>

              {/* Delivery Map Simulation */}
              <div className="delivery-map card">
                <h4>Delivery Location</h4>
                <DeliveryMap 
                  order={selectedOrder}
                  status={typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status}
                />
              </div>

              {/* Driver Notes */}
              {selectedOrder.driver_notes && (
                <div className="driver-notes card">
                  <h4>Driver Notes</h4>
                  <p>{typeof selectedOrder.driver_notes === 'object' ? selectedOrder.driver_notes.display_value : selectedOrder.driver_notes}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Progress Tracking Component
function TrackingProgress({ status }) {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: '📋' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '🏠' }
  ];

  const statusProgress = getStatusProgress(status);
  const currentStepIndex = steps.findIndex(step => step.key === status);

  return (
    <div className="progress-steps">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${statusProgress.progress}%` }}
        />
      </div>
      <div className="steps">
        {steps.map((step, index) => (
          <div 
            key={step.key} 
            className={`step ${index <= currentStepIndex ? 'completed' : ''} ${index === currentStepIndex ? 'current' : ''}`}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Delivery Map Simulation Component
function DeliveryMap({ order, status }) {
  const [driverPosition, setDriverPosition] = useState({ x: 10, y: 10 });

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
      }
    };

    animate();
  }, [status]);

  const deliveryAddress = typeof order.delivery_address === 'object' 
    ? order.delivery_address.display_value 
    : order.delivery_address;

  return (
    <div className="map-container">
      <div className="map-info">
        <p><strong>Delivery Address:</strong> {deliveryAddress}</p>
      </div>
      
      <div className="map-simulation">
        <div className="map-background">
          {/* Store location */}
          <div className="location store" style={{ left: '10%', top: '10%' }}>
            <div className="location-icon">🏪</div>
            <div className="location-label">Store</div>
          </div>
          
          {/* Delivery location */}
          <div className="location delivery" style={{ left: '80%', top: '85%' }}>
            <div className="location-icon">🏠</div>
            <div className="location-label">Your Address</div>
          </div>
          
          {/* Driver position */}
          {status === 'out_for_delivery' && (
            <div 
              className="location driver moving" 
              style={{ left: `${driverPosition.x}%`, top: `${driverPosition.y}%` }}
            >
              <div className="location-icon">🚚</div>
              <div className="location-label">Driver</div>
            </div>
          )}
          
          {/* Route line */}
          <svg className="route-line" width="100%" height="100%">
            <line 
              x1="10%" y1="10%" 
              x2="80%" y2="85%" 
              stroke="#007bff" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
          </svg>
        </div>
        
        <div className="map-status">
          {status === 'out_for_delivery' ? (
            <p>🚚 Your order is on the way!</p>
          ) : status === 'preparing' ? (
            <p>👨‍🍳 Your order is being prepared at the store</p>
          ) : status === 'delivered' ? (
            <p>✅ Your order has been delivered!</p>
          ) : (
            <p>📋 Your order is being processed</p>
          )}
        </div>
      </div>
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
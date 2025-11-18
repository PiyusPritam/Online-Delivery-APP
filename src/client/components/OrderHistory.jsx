/* Enhanced Order History Component with Demo Mode */
import React, { useState, useEffect } from 'react';
import { OrderService } from '../services/OrderService.js';

export default function OrderHistory({ currentUser, onReorder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [reorderLoading, setReorderLoading] = useState(false);

  const orderService = new OrderService();

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  const createDemoOrders = () => {
    const now = new Date();
    return [
      {
        sys_id: { value: 'demo_order_1' },
        order_number: { display_value: 'ORD0001234' },
        status: { value: 'delivered', display_value: 'Delivered' },
        order_date: { display_value: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        total_amount: { display_value: '45.97' },
        payment_method: { display_value: 'Credit Card' },
        delivery_fee: { display_value: '5.99' }
      },
      {
        sys_id: { value: 'demo_order_2' },
        order_number: { display_value: 'ORD0001235' },
        status: { value: 'out_for_delivery', display_value: 'Out for Delivery' },
        order_date: { display_value: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() },
        total_amount: { display_value: '32.48' },
        payment_method: { display_value: 'UPI' },
        delivery_fee: { display_value: '5.99' }
      },
      {
        sys_id: { value: 'demo_order_3' },
        order_number: { display_value: 'ORD0001236' },
        status: { value: 'preparing', display_value: 'Preparing' },
        order_date: { display_value: new Date(now.getTime() - 30 * 60 * 1000).toISOString() },
        total_amount: { display_value: '28.75' },
        payment_method: { display_value: 'Cash on Delivery' },
        delivery_fee: { display_value: '5.99' }
      }
    ];
  };

  const createDemoOrderItems = (orderId) => {
    const itemSets = {
      'demo_order_1': [
        { product: { display_value: 'Fresh Mango' }, quantity: { display_value: '2' }, unit_price: { display_value: '4.99' }, total_price: { display_value: '9.98' } },
        { product: { display_value: 'Organic Banana' }, quantity: { display_value: '1' }, unit_price: { display_value: '2.99' }, total_price: { display_value: '2.99' } },
        { product: { display_value: 'Fresh Milk' }, quantity: { display_value: '1' }, unit_price: { display_value: '5.99' }, total_price: { display_value: '5.99' } }
      ],
      'demo_order_2': [
        { product: { display_value: 'Red Tomatoes' }, quantity: { display_value: '2' }, unit_price: { display_value: '3.49' }, total_price: { display_value: '6.98' } },
        { product: { display_value: 'Basmati Rice' }, quantity: { display_value: '1' }, unit_price: { display_value: '8.99' }, total_price: { display_value: '8.99' } }
      ],
      'demo_order_3': [
        { product: { display_value: 'Fresh Mango' }, quantity: { display_value: '1' }, unit_price: { display_value: '4.99' }, total_price: { display_value: '4.99' } },
        { product: { display_value: 'Organic Banana' }, quantity: { display_value: '2' }, unit_price: { display_value: '2.99' }, total_price: { display_value: '5.98' } }
      ]
    };
    
    return itemSets[orderId] || [];
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      if (!currentUser?.customerProfile) {
        // Demo mode - show sample orders
        const demoOrders = createDemoOrders();
        setOrders(demoOrders);
        setLoading(false);
        return;
      }

      const customerSysId = typeof currentUser.customerProfile.sys_id === 'object' 
        ? currentUser.customerProfile.sys_id.value 
        : currentUser.customerProfile.sys_id;
      
      const orderList = await orderService.getOrdersByCustomer(customerSysId);
      
      // If no orders found, show demo orders
      if (orderList.length === 0) {
        setOrders(createDemoOrders());
      } else {
        setOrders(orderList);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      // Fallback to demo orders
      setOrders(createDemoOrders());
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (orderId) => {
    try {
      // Check if it's a demo order
      if (orderId.startsWith('demo_order_')) {
        const demoItems = createDemoOrderItems(orderId);
        setOrderItems(demoItems);
        return;
      }

      const items = await orderService.getOrderItems(orderId);
      setOrderItems(items);
    } catch (err) {
      console.error('Error loading order items:', err);
      // Fallback to demo items for demo orders
      if (orderId.startsWith('demo_order_')) {
        const demoItems = createDemoOrderItems(orderId);
        setOrderItems(demoItems);
      } else {
        setOrderItems([]);
      }
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    const orderSysId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;
    loadOrderItems(orderSysId);
  };

  const handleReorder = async (order) => {
    const orderSysId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;
    const orderNumber = typeof order.order_number === 'object' ? order.order_number.display_value : order.order_number;
    
    // Handle demo orders
    if (orderSysId.startsWith('demo_order_')) {
      // Show demo notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d1fae5;
        color: #065f46;
        padding: 16px 20px;
        border-radius: 12px;
        border: 1px solid #a7f3d0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
      `;
      notification.innerHTML = `
        ✅ Demo: Items from order #${orderNumber} would be added to cart
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 4000);
      return;
    }

    if (!onReorder) {
      alert('Reorder functionality not available');
      return;
    }

    try {
      setReorderLoading(true);
      
      const result = await onReorder(orderSysId);
      
      if (result.success) {
        // Show success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #d1fae5;
          color: #065f46;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid #a7f3d0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10000;
          font-weight: 600;
          animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = `
          ✅ Success! ${result.itemCount} items from order #${orderNumber} added to cart
        `;
        
        document.body.appendChild(notification);
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
        
        // Remove notification after 4 seconds
        setTimeout(() => {
          notification.style.animation = 'slideIn 0.3s ease-out reverse';
          setTimeout(() => {
            if (notification.parentNode) {
              document.body.removeChild(notification);
            }
            if (style.parentNode) {
              document.head.removeChild(style);
            }
          }, 300);
        }, 4000);
      }
    } catch (error) {
      console.error('Error reordering:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fee2e2;
        color: #dc2626;
        padding: 16px 20px;
        border-radius: 12px;
        border: 1px solid #fecaca;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 600;
      `;
      notification.innerHTML = `❌ Failed to reorder items: ${error.message}`;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 4000);
    } finally {
      setReorderLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const statusMap = {
      'pending': '⏳',
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'out_for_delivery': '🚚',
      'delivered': '📦',
      'cancelled': '❌'
    };
    return statusMap[status] || '📋';
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'preparing': '#8b5cf6',
      'out_for_delivery': '#06b6d4',
      'delivered': '#10b981',
      'cancelled': '#ef4444'
    };
    return statusMap[status] || '#6b7280';
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
    return new Date(dateValue).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProductIcon = (productName) => {
    const name = (productName || '').toLowerCase();
    
    const iconMap = {
      'mango': '🥭', 'banana': '🍌', 'pomegranate': '🟣', 'orange': '🍊', 'grapes': '🍇',
      'tomato': '🍅', 'onion': '🧅', 'potato': '🥔', 'okra': '🫛', 'spinach': '🥬',
      'milk': '🥛', 'paneer': '🧀', 'curd': '🥛', 'ghee': '🧈',
      'chicken': '🐔', 'mutton': '🐑', 'fish': '🐟',
      'rice': '🍚', 'atta': '🌾', 'dal': '🫘', 'oil': '🫗'
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) return icon;
    }
    return '📦';
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const orderNumber = typeof order.order_number === 'object' ? order.order_number.display_value : order.order_number;
      const status = typeof order.status === 'object' ? order.status.value : order.status;
      
      const matchesSearch = searchTerm === '' || orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(typeof a.order_date === 'object' ? a.order_date.display_value : a.order_date);
      const dateB = new Date(typeof b.order_date === 'object' ? b.order_date.display_value : b.order_date);
      
      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      
      const amountA = parseFloat(typeof a.total_amount === 'object' ? a.total_amount.display_value : a.total_amount || 0);
      const amountB = parseFloat(typeof b.total_amount === 'object' ? b.total_amount.display_value : b.total_amount || 0);
      
      return sortBy === 'highest' ? amountB - amountA : amountA - amountB;
    });

  if (loading) {
    return (
      <div className="modern-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h3>Loading your orders...</h3>
          <p>Please wait while we fetch your order history</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="modern-empty">
        <div className="empty-content">
          <div className="empty-icon">📦</div>
          <h2 className="empty-title">No orders yet</h2>
          <p className="empty-subtitle">Your order history will appear here once you make your first order.</p>
          <div className="empty-suggestions">
            <div className="suggestion-card">
              <span className="suggestion-icon">🛒</span>
              <span>Start shopping to see your orders here</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-order-history">
      {/* Header */}
      <div className="history-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Order History</h1>
            <p className="page-subtitle">View and track all your past orders</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-number">{orders.length}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label className="filter-label">Search Orders</label>
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search by order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      <div className="history-layout">
        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.map(order => {
            const orderNumber = typeof order.order_number === 'object' ? order.order_number.display_value : order.order_number;
            const status = typeof order.status === 'object' ? order.status.display_value : order.status;
            const statusValue = typeof order.status === 'object' ? order.status.value : order.status;
            const orderDate = typeof order.order_date === 'object' ? order.order_date.display_value : order.order_date;
            const totalAmount = typeof order.total_amount === 'object' ? order.total_amount.display_value : order.total_amount;
            const orderSysId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;
            const selectedSysId = typeof selectedOrder?.sys_id === 'object' ? selectedOrder.sys_id.value : selectedOrder?.sys_id;

            return (
              <div 
                key={orderSysId}
                className={`order-card ${orderSysId === selectedSysId ? 'selected' : ''}`}
                onClick={() => handleOrderClick(order)}
              >
                <div className="card-header">
                  <div className="order-info">
                    <div className="order-number">
                      <span className="order-hash">#</span>
                      <span className="order-id">{orderNumber}</span>
                    </div>
                    <div className="order-date">{formatDate(orderDate)}</div>
                  </div>
                  
                  <div className="order-status">
                    <div 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(statusValue)}20`,
                        color: getStatusColor(statusValue),
                        borderColor: `${getStatusColor(statusValue)}40`
                      }}
                    >
                      <span className="status-icon">{getStatusIcon(statusValue)}</span>
                      <span className="status-text">{status}</span>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="order-summary">
                    <div className="order-amount">
                      <span className="amount-label">Total</span>
                      <span className="amount-value">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="action-btn view-details"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderClick(order);
                      }}
                    >
                      <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      View Details
                    </button>
                    
                    {statusValue === 'delivered' && (
                      <button 
                        className="action-btn reorder"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(order);
                        }}
                        disabled={reorderLoading}
                      >
                        {reorderLoading ? (
                          <>
                            <div className="btn-spinner"></div>
                            Reordering...
                          </>
                        ) : (
                          <>
                            <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                            </svg>
                            Reorder
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="card-hover-effect"></div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No orders found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Order Details Sidebar */}
        {selectedOrder && (
          <div className="order-details-sidebar">
            <div className="details-header">
              <h3 className="details-title">Order Details</h3>
              <button 
                className="close-details-btn"
                onClick={() => setSelectedOrder(null)}
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            <div className="details-content">
              {/* Order Summary */}
              <div className="details-section">
                <h4 className="section-title">Order Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">Order Number</span>
                    <span className="value">
                      #{typeof selectedOrder.order_number === 'object' ? selectedOrder.order_number.display_value : selectedOrder.order_number}
                    </span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="label">Status</span>
                    <div 
                      className="status-badge small"
                      style={{ 
                        backgroundColor: `${getStatusColor(typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status)}20`,
                        color: getStatusColor(typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status)
                      }}
                    >
                      {getStatusIcon(typeof selectedOrder.status === 'object' ? selectedOrder.status.value : selectedOrder.status)}
                      {typeof selectedOrder.status === 'object' ? selectedOrder.status.display_value : selectedOrder.status}
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <span className="label">Order Date</span>
                    <span className="value">{formatDate(selectedOrder.order_date)}</span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="label">Payment Method</span>
                    <span className="value">
                      {typeof selectedOrder.payment_method === 'object' ? selectedOrder.payment_method.display_value : selectedOrder.payment_method}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="details-section">
                <h4 className="section-title">Items Ordered</h4>
                {orderItems.length === 0 ? (
                  <div className="loading-items">
                    <div className="loading-spinner small"></div>
                    <span>Loading items...</span>
                  </div>
                ) : (
                  <div className="items-list">
                    {orderItems.map((item, index) => {
                      const productName = typeof item.product === 'object' ? item.product.display_value : item.product;
                      const quantity = typeof item.quantity === 'object' ? item.quantity.display_value : item.quantity;
                      const unitPrice = typeof item.unit_price === 'object' ? item.unit_price.display_value : item.unit_price;
                      const totalPrice = typeof item.total_price === 'object' ? item.total_price.display_value : item.total_price;

                      return (
                        <div key={index} className="order-item">
                          <div className="item-icon">
                            {getProductIcon(productName)}
                          </div>
                          <div className="item-details">
                            <div className="item-name">{productName}</div>
                            <div className="item-meta">
                              <span>Qty: {quantity}</span>
                              <span>@ {formatPrice(unitPrice)}</span>
                            </div>
                          </div>
                          <div className="item-total">
                            {formatPrice(totalPrice)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order Total */}
              <div className="details-section">
                <div className="total-breakdown">
                  <div className="total-line">
                    <span>Delivery Fee</span>
                    <span>{formatPrice(typeof selectedOrder.delivery_fee === 'object' ? selectedOrder.delivery_fee.display_value : selectedOrder.delivery_fee || 0)}</span>
                  </div>
                  <div className="total-line final-total">
                    <span>Total Amount</span>
                    <span>{formatPrice(typeof selectedOrder.total_amount === 'object' ? selectedOrder.total_amount.display_value : selectedOrder.total_amount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .modern-order-history {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 24px 20px;
        }

        /* Loading States */
        .modern-loading,
        .modern-error {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-content,
        .error-content {
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

        .loading-spinner.small {
          width: 24px;
          height: 24px;
          border-width: 2px;
          margin: 0 8px 0 0;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon {
          font-size: 4rem;
          margin-bottom: 16px;
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

        /* Empty State */
        .modern-empty {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-content {
          text-align: center;
          max-width: 500px;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 24px;
          opacity: 0.6;
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

        /* Header */
        .history-header {
          max-width: 1400px;
          margin: 0 auto 32px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
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

        .header-stats {
          display: flex;
          gap: 16px;
        }

        .stat-card {
          background: white;
          padding: 20px 24px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          text-align: center;
          min-width: 120px;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 4px;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Filters */
        .filters-section {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 200px;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          font-size: 0.875rem;
          transition: border-color 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .filter-select {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        /* Layout */
        .history-layout {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 32px;
          align-items: start;
        }

        /* Orders List */
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .order-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }

        .order-card.selected {
          border-color: #3b82f6;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
        }

        .card-hover-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(16, 185, 129, 0.02) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .order-card:hover .card-hover-effect {
          opacity: 1;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .order-number {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .order-hash {
          color: #9ca3af;
        }

        .order-date {
          color: #6b7280;
          font-size: 0.875rem;
          margin-top: 4px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid;
        }

        .status-badge.small {
          padding: 4px 10px;
          font-size: 0.75rem;
        }

        .card-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .amount-label {
          display: block;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 4px;
        }

        .amount-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #059669;
        }

        .card-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: white;
          color: #374151;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .action-btn:hover:not(:disabled) {
          background: #f3f4f6;
          transform: translateY(-1px);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .action-btn.view-details {
          color: #3b82f6;
          border-color: #3b82f6;
        }

        .action-btn.view-details:hover {
          background: #eff6ff;
        }

        .action-btn.reorder {
          color: #059669;
          border-color: #059669;
        }

        .action-btn.reorder:hover:not(:disabled) {
          background: #f0fdf4;
        }

        .btn-icon {
          width: 16px;
          height: 16px;
        }

        /* No Results */
        .no-results {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .no-results-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        /* Order Details Sidebar */
        .order-details-sidebar {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          position: sticky;
          top: 20px;
          max-height: calc(100vh - 40px);
          display: flex;
          flex-direction: column;
        }

        .details-header {
          padding: 24px 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 20px;
        }

        .details-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .close-details-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-details-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .close-details-btn svg {
          width: 16px;
          height: 16px;
        }

        .details-content {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .details-section {
          margin-bottom: 32px;
        }

        .details-section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px 0;
        }

        /* Summary Grid */
        .summary-grid {
          display: grid;
          gap: 12px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-item .label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .summary-item .value {
          font-weight: 600;
          color: #1f2937;
        }

        /* Items List */
        .loading-items {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #6b7280;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .item-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 10px;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .item-meta {
          display: flex;
          gap: 12px;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .item-total {
          font-weight: 600;
          color: #059669;
        }

        /* Total Breakdown */
        .total-breakdown {
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          color: #6b7280;
        }

        .total-line:last-child {
          margin-bottom: 0;
        }

        .final-total {
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          color: #1f2937;
          font-weight: 700;
          font-size: 1.125rem;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .history-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .order-details-sidebar {
            position: static;
            max-height: none;
          }
        }

        @media (max-width: 768px) {
          .modern-order-history {
            padding: 16px 12px;
          }
          
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }
          
          .header-stats {
            justify-content: center;
          }
          
          .filters-section {
            flex-direction: column;
          }
          
          .filter-group {
            min-width: auto;
          }
          
          .card-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          
          .card-body {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          
          .card-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
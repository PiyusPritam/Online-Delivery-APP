import React, { useState, useEffect } from 'react';
import { ProductService } from '../../services/ProductService.js';
import { OrderService } from '../services/OrderService.js';

export default function Dashboard({ darkMode }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    todayOrders: 0,
    revenue: 0,
    lowStockProducts: 0,
    activeCustomers: 0,
    completedOrders: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const productService = new ProductService();
  const orderService = new OrderService();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load products and calculate stats
      const products = await productService.getProducts();
      const orders = await orderService.getOrders();
      const recentOrdersList = orders.slice(0, 8);

      // Calculate today's orders
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(order => {
        const orderDate = typeof order.sys_created_on === 'object' 
          ? order.sys_created_on.display_value 
          : order.sys_created_on;
        return orderDate && orderDate.startsWith(today);
      });

      // Calculate completed and pending orders
      const completedOrders = orders.filter(order => {
        const status = typeof order.status === 'object' ? order.status.value : order.status;
        return status === 'delivered' || status === 'completed';
      });

      const pendingOrders = orders.filter(order => {
        const status = typeof order.status === 'object' ? order.status.value : order.status;
        return status === 'pending' || status === 'processing';
      });
      
      // Calculate revenue (from completed orders)
      const totalRevenue = completedOrders.reduce((sum, order) => {
        const total = typeof order.total_amount === 'object' 
          ? parseFloat(order.total_amount.display_value || 0)
          : parseFloat(order.total_amount || 0);
        return sum + total;
      }, 0);

      // Calculate low stock products
      const lowStockProducts = products.filter(product => {
        const stock = typeof product.stock_quantity === 'object' 
          ? parseInt(product.stock_quantity.display_value || 0)
          : parseInt(product.stock_quantity || 0);
        return stock < 10;
      });

      // Get unique customers
      const uniqueCustomers = new Set(orders.map(order => {
        return typeof order.customer === 'object' ? order.customer.value : order.customer;
      })).size;

      // Get top products (mock data for demo)
      const topProductsList = products.slice(0, 5);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        revenue: totalRevenue,
        lowStockProducts: lowStockProducts.length,
        activeCustomers: uniqueCustomers,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length
      });

      setRecentOrders(recentOrdersList);
      setTopProducts(topProductsList);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={`dashboard-loading ${darkMode ? 'dark-mode' : ''}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h3>Loading FreshCart Dashboard...</h3>
          <p>Preparing your store analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`modern-dashboard ${darkMode ? 'dark-mode' : ''}`}>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">Store Overview</h1>
            <p className="dashboard-subtitle">Monitor your FreshCart store performance and manage operations</p>
          </div>
          <div className="header-actions">
            <button className="action-btn primary">
              <span className="btn-icon">📊</span>
              <span>View Reports</span>
            </button>
            <button className="action-btn secondary">
              <span className="btn-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card revenue">
          <div className="metric-header">
            <div className="metric-icon">💰</div>
            <div className="metric-trend up">+12%</div>
          </div>
          <div className="metric-value">{formatCurrency(stats.revenue)}</div>
          <div className="metric-label">Total Revenue</div>
          <div className="metric-subtext">From {stats.completedOrders} completed orders</div>
        </div>

        <div className="metric-card orders">
          <div className="metric-header">
            <div className="metric-icon">🛒</div>
            <div className="metric-trend up">+8%</div>
          </div>
          <div className="metric-value">{stats.totalOrders}</div>
          <div className="metric-label">Total Orders</div>
          <div className="metric-subtext">{stats.todayOrders} orders today</div>
        </div>

        <div className="metric-card products">
          <div className="metric-header">
            <div className="metric-icon">📦</div>
            <div className="metric-trend neutral">-</div>
          </div>
          <div className="metric-value">{stats.totalProducts}</div>
          <div className="metric-label">Products in Catalog</div>
          <div className="metric-subtext">{stats.lowStockProducts} low stock items</div>
        </div>

        <div className="metric-card customers">
          <div className="metric-header">
            <div className="metric-icon">👥</div>
            <div className="metric-trend up">+5%</div>
          </div>
          <div className="metric-value">{stats.activeCustomers}</div>
          <div className="metric-label">Active Customers</div>
          <div className="metric-subtext">This month</div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Quick Actions Block */}
        <div className="dashboard-block quick-actions">
          <div className="block-header">
            <h3 className="block-title">Quick Actions</h3>
            <p className="block-subtitle">Manage your store efficiently</p>
          </div>
          <div className="actions-grid">
            <button className="quick-action-btn add-product">
              <div className="action-icon">➕</div>
              <div className="action-content">
                <span className="action-title">Add Product</span>
                <span className="action-desc">New inventory item</span>
              </div>
            </button>
            <button className="quick-action-btn process-orders">
              <div className="action-icon">✅</div>
              <div className="action-content">
                <span className="action-title">Process Orders</span>
                <span className="action-desc">{stats.pendingOrders} pending</span>
              </div>
            </button>
            <button className="quick-action-btn inventory">
              <div className="action-icon">📋</div>
              <div className="action-content">
                <span className="action-title">Check Inventory</span>
                <span className="action-desc">Stock management</span>
              </div>
            </button>
            <button className="quick-action-btn analytics">
              <div className="action-icon">📈</div>
              <div className="action-content">
                <span className="action-title">View Analytics</span>
                <span className="action-desc">Performance insights</span>
              </div>
            </button>
          </div>
        </div>

        {/* Order Status Block */}
        <div className="dashboard-block order-status">
          <div className="block-header">
            <h3 className="block-title">Order Status</h3>
            <p className="block-subtitle">Real-time order monitoring</p>
          </div>
          <div className="status-grid">
            <div className="status-item pending">
              <div className="status-count">{stats.pendingOrders}</div>
              <div className="status-label">Pending</div>
              <div className="status-icon">⏳</div>
            </div>
            <div className="status-item processing">
              <div className="status-count">{Math.floor(stats.totalOrders * 0.2)}</div>
              <div className="status-label">Processing</div>
              <div className="status-icon">🔄</div>
            </div>
            <div className="status-item shipping">
              <div className="status-count">{Math.floor(stats.totalOrders * 0.15)}</div>
              <div className="status-label">Shipping</div>
              <div className="status-icon">🚚</div>
            </div>
            <div className="status-item completed">
              <div className="status-count">{stats.completedOrders}</div>
              <div className="status-label">Completed</div>
              <div className="status-icon">✅</div>
            </div>
          </div>
        </div>

        {/* Recent Orders Block */}
        <div className="dashboard-block recent-orders">
          <div className="block-header">
            <h3 className="block-title">Recent Orders</h3>
            <p className="block-subtitle">Latest customer orders</p>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="orders-list">
            {recentOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No recent orders found</p>
              </div>
            ) : (
              recentOrders.slice(0, 6).map((order, index) => {
                const orderId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;
                const customerName = typeof order.customer_name === 'object' 
                  ? order.customer_name.display_value 
                  : order.customer_name || 'Customer';
                const totalAmount = typeof order.total_amount === 'object' 
                  ? order.total_amount.display_value 
                  : order.total_amount;
                const status = typeof order.status === 'object' 
                  ? order.status.display_value 
                  : order.status;
                const createdOn = typeof order.sys_created_on === 'object' 
                  ? order.sys_created_on.display_value 
                  : order.sys_created_on;

                return (
                  <div key={orderId} className="order-item">
                    <div className="order-avatar">
                      {customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="order-details">
                      <div className="order-customer">{customerName}</div>
                      <div className="order-id">#{orderId.substring(0, 8)}</div>
                      <div className="order-time">{new Date(createdOn).toLocaleString()}</div>
                    </div>
                    <div className="order-amount">
                      {formatCurrency(parseFloat(totalAmount || 0))}
                    </div>
                    <div className={`order-status ${getStatusClass(status)}`}>
                      {status || 'pending'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Performance Analytics Block */}
        <div className="dashboard-block performance">
          <div className="block-header">
            <h3 className="block-title">Performance Metrics</h3>
            <p className="block-subtitle">Key business indicators</p>
          </div>
          <div className="performance-grid">
            <div className="performance-item">
              <div className="performance-icon">📊</div>
              <div className="performance-content">
                <div className="performance-value">{formatCurrency(stats.totalOrders > 0 ? stats.revenue / stats.totalOrders : 0)}</div>
                <div className="performance-label">Avg Order Value</div>
                <div className="performance-change positive">+15%</div>
              </div>
            </div>
            <div className="performance-item">
              <div className="performance-icon">🎯</div>
              <div className="performance-content">
                <div className="performance-value">{stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%</div>
                <div className="performance-label">Completion Rate</div>
                <div className="performance-change positive">+8%</div>
              </div>
            </div>
            <div className="performance-item">
              <div className="performance-icon">⚡</div>
              <div className="performance-content">
                <div className="performance-value">25min</div>
                <div className="performance-label">Avg Prep Time</div>
                <div className="performance-change negative">-5min</div>
              </div>
            </div>
            <div className="performance-item">
              <div className="performance-icon">⭐</div>
              <div className="performance-content">
                <div className="performance-value">4.8</div>
                <div className="performance-label">Customer Rating</div>
                <div className="performance-change positive">+0.2</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Alerts Block */}
        <div className="dashboard-block inventory-alerts">
          <div className="block-header">
            <h3 className="block-title">Inventory Alerts</h3>
            <p className="block-subtitle">Stock level monitoring</p>
          </div>
          <div className="alerts-content">
            {stats.lowStockProducts > 0 ? (
              <div className="alert-item low-stock">
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                  <div className="alert-title">Low Stock Alert</div>
                  <div className="alert-desc">{stats.lowStockProducts} products need restocking</div>
                </div>
                <button className="alert-action">View Items</button>
              </div>
            ) : (
              <div className="alert-item success">
                <div className="alert-icon">✅</div>
                <div className="alert-content">
                  <div className="alert-title">All Good!</div>
                  <div className="alert-desc">All products are well stocked</div>
                </div>
              </div>
            )}
            
            <div className="stock-summary">
              <div className="stock-item">
                <div className="stock-label">In Stock</div>
                <div className="stock-value good">{stats.totalProducts - stats.lowStockProducts}</div>
              </div>
              <div className="stock-item">
                <div className="stock-label">Low Stock</div>
                <div className="stock-value warning">{stats.lowStockProducts}</div>
              </div>
              <div className="stock-item">
                <div className="stock-label">Out of Stock</div>
                <div className="stock-value critical">0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products Block */}
        <div className="dashboard-block top-products">
          <div className="block-header">
            <h3 className="block-title">Top Products</h3>
            <p className="block-subtitle">Best performing items</p>
          </div>
          <div className="products-list">
            {topProducts.slice(0, 5).map((product, index) => {
              const productId = typeof product.sys_id === 'object' ? product.sys_id.value : product.sys_id;
              const name = typeof product.name === 'object' ? product.name.display_value : product.name;
              const price = typeof product.price === 'object' ? product.price.display_value : product.price;
              const category = typeof product.category === 'object' ? product.category.display_value : product.category;

              return (
                <div key={productId} className="product-item">
                  <div className="product-rank">#{index + 1}</div>
                  <div className="product-info">
                    <div className="product-name">{name}</div>
                    <div className="product-category">{category}</div>
                  </div>
                  <div className="product-stats">
                    <div className="product-price">{formatCurrency(parseFloat(price || 0))}</div>
                    <div className="product-sales">{Math.floor(Math.random() * 50 + 10)} sold</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <style jsx>{`
        .modern-dashboard {
          min-height: 100vh;
          background: var(--bg-secondary);
          padding: 0;
          transition: all 0.3s ease;
        }

        .dark-mode {
          --bg-primary: #1f2937;
          --bg-secondary: #111827;
          --bg-tertiary: #0f1419;
          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --text-tertiary: #9ca3af;
          --border-light: #374151;
          --border-medium: #4b5563;
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
          --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
          --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        /* Dashboard Loading */
        .dashboard-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
        }

        .loading-container {
          text-align: center;
          max-width: 400px;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 6px solid var(--border-light);
          border-top: 6px solid #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Dashboard Header */
        .dashboard-header {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-light);
          padding: 24px 32px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1600px;
          margin: 0 auto;
          flex-wrap: wrap;
          gap: 20px;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .dashboard-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }

        .action-btn.secondary {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
        }

        .action-btn.secondary:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          padding: 32px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .metric-card {
          background: var(--bg-primary);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .metric-card.orders::before {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .metric-card.products::before {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .metric-card.customers::before {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .metric-icon {
          width: 48px;
          height: 48px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .metric-trend {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .metric-trend.up {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        .metric-trend.down {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        .metric-trend.neutral {
          background: var(--bg-secondary);
          color: var(--text-tertiary);
        }

        .metric-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
          line-height: 1;
        }

        .metric-label {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .metric-subtext {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
          padding: 0 32px 32px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .dashboard-block {
          background: var(--bg-primary);
          border-radius: 20px;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .dashboard-block:hover {
          box-shadow: var(--shadow-md);
        }

        .block-header {
          padding: 24px 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .block-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .block-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .view-all-btn {
          background: transparent;
          border: none;
          color: #10b981;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.875rem;
          padding: 4px 0;
        }

        .view-all-btn:hover {
          text-decoration: underline;
        }

        /* Quick Actions Block */
        .quick-actions {
          grid-column: span 6;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 24px;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .quick-action-btn:hover {
          background: var(--bg-tertiary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .action-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .action-content {
          flex: 1;
        }

        .action-title {
          display: block;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .action-desc {
          display: block;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        /* Order Status Block */
        .order-status {
          grid-column: span 6;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 24px;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 16px;
          position: relative;
        }

        .status-count {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .status-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .status-icon {
          font-size: 1.5rem;
          position: absolute;
          top: 12px;
          right: 12px;
        }

        /* Recent Orders Block */
        .recent-orders {
          grid-column: span 8;
        }

        .orders-list {
          padding: 0 24px 24px;
          max-height: 400px;
          overflow-y: auto;
        }

        .order-item {
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          gap: 16px;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--border-light);
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .order-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1rem;
        }

        .order-details {
          min-width: 0;
        }

        .order-customer {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .order-id {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-bottom: 2px;
        }

        .order-time {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .order-amount {
          font-weight: 700;
          color: #10b981;
          font-size: 1rem;
        }

        .order-status {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .order-status.pending {
          background: rgba(251, 191, 36, 0.1);
          color: #d97706;
        }

        .order-status.processing {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .order-status.delivered,
        .order-status.completed {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        .order-status.cancelled {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        /* Performance Block */
        .performance {
          grid-column: span 4;
        }

        .performance-grid {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .performance-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 12px;
        }

        .performance-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .performance-content {
          flex: 1;
        }

        .performance-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .performance-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .performance-change {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .performance-change.positive {
          color: #059669;
        }

        .performance-change.negative {
          color: #dc2626;
        }

        /* Inventory Alerts Block */
        .inventory-alerts {
          grid-column: span 6;
        }

        .alerts-content {
          padding: 24px;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 16px;
          margin-bottom: 20px;
        }

        .alert-item.low-stock {
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.2);
        }

        .alert-item.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .alert-icon {
          font-size: 1.5rem;
        }

        .alert-content {
          flex: 1;
        }

        .alert-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .alert-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .alert-action {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .stock-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .stock-item {
          text-align: center;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 12px;
        }

        .stock-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .stock-value {
          font-size: 1.5rem;
          font-weight: 800;
        }

        .stock-value.good {
          color: #059669;
        }

        .stock-value.warning {
          color: #d97706;
        }

        .stock-value.critical {
          color: #dc2626;
        }

        /* Top Products Block */
        .top-products {
          grid-column: span 6;
        }

        .products-list {
          padding: 0 24px 24px;
        }

        .product-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border-light);
        }

        .product-item:last-child {
          border-bottom: none;
        }

        .product-rank {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .product-info {
          flex: 1;
          min-width: 0;
        }

        .product-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .product-category {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .product-stats {
          text-align: right;
        }

        .product-price {
          font-weight: 700;
          color: #10b981;
          margin-bottom: 4px;
        }

        .product-sales {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-secondary);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: repeat(8, 1fr);
          }
          
          .quick-actions,
          .order-status {
            grid-column: span 4;
          }
          
          .recent-orders {
            grid-column: span 8;
          }
          
          .performance,
          .inventory-alerts,
          .top-products {
            grid-column: span 4;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 20px 16px;
          }
          
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .metrics-grid,
          .dashboard-grid {
            padding: 20px 16px;
            grid-template-columns: 1fr;
          }
          
          .dashboard-block {
            grid-column: span 1 !important;
          }
          
          .actions-grid,
          .status-grid {
            grid-template-columns: 1fr;
          }
          
          .stock-summary {
            grid-template-columns: 1fr;
          }
          
          .order-item {
            grid-template-columns: auto 1fr auto;
            gap: 12px;
          }
          
          .order-amount {
            grid-column: span 1;
            grid-row: 2;
            justify-self: start;
            margin-top: 8px;
          }
          
          .order-status {
            grid-column: span 1;
            grid-row: 2;
            justify-self: end;
            margin-top: 8px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-header {
            padding: 16px 12px;
          }
          
          .metrics-grid,
          .dashboard-grid {
            padding: 16px 12px;
            gap: 16px;
          }
          
          .metric-card {
            padding: 20px;
          }
          
          .block-header {
            padding: 20px 20px 0;
          }
          
          .quick-action-btn {
            padding: 16px;
          }
          
          .action-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}

function getStatusClass(status) {
  const statusLower = (status || '').toLowerCase();
  switch (statusLower) {
    case 'delivered':
    case 'completed':
      return 'delivered';
    case 'processing':
    case 'confirmed':
      return 'processing';
    case 'shipped':
    case 'out_for_delivery':
      return 'processing';
    case 'cancelled':
    case 'failed':
      return 'cancelled';
    default:
      return 'pending';
  }
}
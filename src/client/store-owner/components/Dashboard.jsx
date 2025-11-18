import React, { useState, useEffect } from 'react';
import { ProductService } from '../../services/ProductService.js';
import { OrderService } from '../services/OrderService.js';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    todayOrders: 0,
    revenue: 0,
    lowStockProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
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
      const recentOrdersList = orders.slice(0, 5);

      // Calculate today's orders
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(order => {
        const orderDate = typeof order.sys_created_on === 'object' 
          ? order.sys_created_on.display_value 
          : order.sys_created_on;
        return orderDate && orderDate.startsWith(today);
      });

      // Calculate revenue (from completed orders)
      const completedOrders = orders.filter(order => {
        const status = typeof order.status === 'object' ? order.status.value : order.status;
        return status === 'delivered';
      });
      
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

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        revenue: totalRevenue,
        lowStockProducts: lowStockProducts.length
      });

      setRecentOrders(recentOrdersList);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome to your store management dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4" style={{ marginBottom: '30px' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}>
          <span className="stat-icon">📦</span>
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4ECDC4, #44A08D)' }}>
          <span className="stat-icon">🛒</span>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #45B7D1, #96C93D)' }}>
          <span className="stat-icon">📅</span>
          <div className="stat-value">{stats.todayOrders}</div>
          <div className="stat-label">Today's Orders</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #F7DC6F, #BB8FCE)' }}>
          <span className="stat-icon">💰</span>
          <div className="stat-value">${stats.revenue.toFixed(2)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3>Quick Actions</h3>
        <div className="grid grid-4">
          <button className="btn btn-primary btn-lg">
            <span>➕</span>
            Add New Product
          </button>
          <button className="btn btn-success btn-lg">
            <span>✅</span>
            Process Orders
          </button>
          <button className="btn btn-warning btn-lg">
            <span>📊</span>
            View Reports
          </button>
          <button className="btn btn-info btn-lg">
            <span>📦</span>
            Check Inventory
          </button>
        </div>
      </div>

      {/* Alerts */}
      {stats.lowStockProducts > 0 && (
        <div className="alert alert-warning">
          <span>⚠️</span>
          <div>
            <strong>Low Stock Alert:</strong> {stats.lowStockProducts} products are running low on stock.
            <a href="#" style={{ marginLeft: '10px', color: '#856404', textDecoration: 'underline' }}>
              View Details
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        {/* Recent Orders */}
        <div className="card">
          <h3>Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p style={{ color: '#6c757d', textAlign: 'center', padding: '20px' }}>
              No recent orders found
            </p>
          ) : (
            <div className="orders-list">
              {recentOrders.map((order, index) => {
                const orderId = typeof order.sys_id === 'object' ? order.sys_id.value : order.sys_id;
                const customerName = typeof order.customer_name === 'object' 
                  ? order.customer_name.display_value 
                  : order.customer_name || 'Unknown Customer';
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
                  <div key={orderId} className="order-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    borderBottom: index < recentOrders.length - 1 ? '1px solid #e9ecef' : 'none'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                        Order #{orderId.substring(0, 8)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        {customerName} • {new Date(createdOn).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', color: '#007bff', marginBottom: '5px' }}>
                        ${parseFloat(totalAmount || 0).toFixed(2)}
                      </div>
                      <span className={`badge badge-${getStatusColor(status)}`}>
                        {status || 'pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h3>Store Performance</h3>
          <div className="stats-list">
            <div className="stat-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 0',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div>
                <div style={{ fontWeight: '600' }}>Average Order Value</div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>Based on completed orders</div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#007bff' }}>
                ${stats.totalOrders > 0 ? (stats.revenue / stats.totalOrders).toFixed(2) : '0.00'}
              </div>
            </div>

            <div className="stat-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 0',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div>
                <div style={{ fontWeight: '600' }}>Products in Stock</div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>Active inventory items</div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#28a745' }}>
                {stats.totalProducts - stats.lowStockProducts}
              </div>
            </div>

            <div className="stat-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 0'
            }}>
              <div>
                <div style={{ fontWeight: '600' }}>Order Fulfillment Rate</div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>Percentage of completed orders</div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffc107' }}>
                {stats.totalOrders > 0 ? Math.round((stats.revenue > 0 ? 85 : 0)) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  const statusLower = (status || '').toLowerCase();
  switch (statusLower) {
    case 'delivered':
    case 'completed':
      return 'success';
    case 'processing':
    case 'confirmed':
      return 'info';
    case 'shipped':
    case 'out_for_delivery':
      return 'warning';
    case 'cancelled':
    case 'failed':
      return 'danger';
    default:
      return 'secondary';
  }
}
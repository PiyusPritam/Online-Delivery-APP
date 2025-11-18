import React, { useState, useEffect } from 'react';
import { ProductService } from '../../services/ProductService.js';
import { OrderService } from '../services/OrderService.js';

export default function Reports() {
  const [reportData, setReportData] = useState({
    salesByCategory: [],
    salesByProduct: [],
    ordersByStatus: [],
    revenueByDate: [],
    topProducts: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [activeReport, setActiveReport] = useState('overview');

  const productService = new ProductService();
  const orderService = new OrderService();

  useEffect(() => {
    generateReports();
  }, [dateRange]);

  const generateReports = async () => {
    try {
      setLoading(true);
      
      // Load data
      const [products, orders] = await Promise.all([
        productService.getProducts(),
        orderService.getOrders()
      ]);

      // Filter orders by date range
      const filteredOrders = orders.filter(order => {
        const orderDate = typeof order.sys_created_on === 'object' 
          ? order.sys_created_on.display_value 
          : order.sys_created_on;
        const orderDateOnly = new Date(orderDate).toISOString().split('T')[0];
        return orderDateOnly >= dateRange.startDate && orderDateOnly <= dateRange.endDate;
      });

      // Generate various reports
      const salesByCategory = generateSalesByCategory(products, filteredOrders);
      const salesByProduct = generateSalesByProduct(products, filteredOrders);
      const ordersByStatus = generateOrdersByStatus(filteredOrders);
      const revenueByDate = generateRevenueByDate(filteredOrders);
      const topProducts = generateTopProducts(products, filteredOrders);
      const lowStockProducts = generateLowStockProducts(products);

      setReportData({
        salesByCategory,
        salesByProduct,
        ordersByStatus,
        revenueByDate,
        topProducts,
        lowStockProducts
      });
    } catch (error) {
      console.error('Error generating reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSalesByCategory = (products, orders) => {
    const categoryMap = {};
    
    // Initialize categories
    products.forEach(product => {
      const category = typeof product.category === 'object' 
        ? product.category.display_value 
        : product.category;
      if (category && !categoryMap[category]) {
        categoryMap[category] = { category, revenue: 0, orders: 0, products: 0 };
      }
    });

    // Count products per category
    products.forEach(product => {
      const category = typeof product.category === 'object' 
        ? product.category.display_value 
        : product.category;
      if (category && categoryMap[category]) {
        categoryMap[category].products++;
      }
    });

    // Calculate sales (mock data since we don't have order items)
    orders.forEach(order => {
      const status = typeof order.status === 'object' ? order.status.value : order.status;
      if (status === 'delivered') {
        // Distribute revenue randomly among categories for demo
        const categories = Object.keys(categoryMap);
        if (categories.length > 0) {
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];
          const amount = typeof order.total_amount === 'object' 
            ? parseFloat(order.total_amount.display_value || 0)
            : parseFloat(order.total_amount || 0);
          
          categoryMap[randomCategory].revenue += amount;
          categoryMap[randomCategory].orders++;
        }
      }
    });

    return Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);
  };

  const generateSalesByProduct = (products, orders) => {
    // Mock product sales data
    return products.slice(0, 10).map(product => {
      const name = typeof product.name === 'object' ? product.name.display_value : product.name;
      const price = typeof product.price === 'object' 
        ? parseFloat(product.price.display_value || 0)
        : parseFloat(product.price || 0);
      
      // Mock sales data
      const unitsSold = Math.floor(Math.random() * 50) + 1;
      const revenue = price * unitsSold;
      
      return {
        product: name,
        unitsSold,
        revenue,
        averagePrice: price
      };
    }).sort((a, b) => b.revenue - a.revenue);
  };

  const generateOrdersByStatus = (orders) => {
    const statusMap = {};
    
    orders.forEach(order => {
      const status = typeof order.status === 'object' 
        ? order.status.display_value 
        : order.status || 'pending';
      
      if (!statusMap[status]) {
        statusMap[status] = { status, count: 0 };
      }
      statusMap[status].count++;
    });

    return Object.values(statusMap).sort((a, b) => b.count - a.count);
  };

  const generateRevenueByDate = (orders) => {
    const dateMap = {};
    
    orders.forEach(order => {
      const status = typeof order.status === 'object' ? order.status.value : order.status;
      if (status === 'delivered') {
        const orderDate = typeof order.sys_created_on === 'object' 
          ? order.sys_created_on.display_value 
          : order.sys_created_on;
        const dateOnly = new Date(orderDate).toISOString().split('T')[0];
        const amount = typeof order.total_amount === 'object' 
          ? parseFloat(order.total_amount.display_value || 0)
          : parseFloat(order.total_amount || 0);
        
        if (!dateMap[dateOnly]) {
          dateMap[dateOnly] = { date: dateOnly, revenue: 0, orders: 0 };
        }
        dateMap[dateOnly].revenue += amount;
        dateMap[dateOnly].orders++;
      }
    });

    return Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const generateTopProducts = (products, orders) => {
    // Mock top products based on stock sold
    return products.slice(0, 5).map(product => {
      const name = typeof product.name === 'object' ? product.name.display_value : product.name;
      const stockQuantity = typeof product.stock_quantity === 'object' 
        ? parseInt(product.stock_quantity.display_value || 0)
        : parseInt(product.stock_quantity || 0);
      
      // Mock sales (assume some stock was sold)
      const unitsSold = Math.max(0, 100 - stockQuantity + Math.floor(Math.random() * 20));
      
      return {
        product: name,
        unitsSold,
        currentStock: stockQuantity,
        category: typeof product.category === 'object' 
          ? product.category.display_value 
          : product.category
      };
    }).sort((a, b) => b.unitsSold - a.unitsSold);
  };

  const generateLowStockProducts = (products) => {
    return products.filter(product => {
      const stockQuantity = typeof product.stock_quantity === 'object' 
        ? parseInt(product.stock_quantity.display_value || 0)
        : parseInt(product.stock_quantity || 0);
      return stockQuantity < 10;
    }).map(product => ({
      product: typeof product.name === 'object' ? product.name.display_value : product.name,
      currentStock: typeof product.stock_quantity === 'object' 
        ? parseInt(product.stock_quantity.display_value || 0)
        : parseInt(product.stock_quantity || 0),
      category: typeof product.category === 'object' 
        ? product.category.display_value 
        : product.category,
      price: typeof product.price === 'object' 
        ? parseFloat(product.price.display_value || 0)
        : parseFloat(product.price || 0)
    })).sort((a, b) => a.currentStock - b.currentStock);
  };

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'groceries': '🛒',
      'vegetables': '🥬',
      'fruits': '🍎',
      'dairy': '🥛',
      'meat': '🥩',
      'beverages': '🥤',
      'household': '🏠',
      'personal_care': '🧴'
    };
    return emojiMap[category?.toLowerCase()] || '📦';
  };

  const reportTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'sales', label: 'Sales Analysis', icon: '💰' },
    { id: 'products', label: 'Product Performance', icon: '📦' },
    { id: 'inventory', label: 'Inventory Status', icon: '📋' }
  ];

  return (
    <div className="main-content">
      <div className="page-header">
        <h2>Reports & Analytics</h2>
        <p>Analyze your store performance and trends</p>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
          </div>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>

          <button 
            className="btn btn-primary" 
            onClick={generateReports}
            style={{ marginTop: '25px' }}
          >
            <span>🔄</span>
            Refresh Reports
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #e9ecef' }}>
          {reportTabs.map(tab => (
            <button
              key={tab.id}
              className={`btn ${activeReport === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveReport(tab.id)}
              style={{ 
                borderRadius: '8px 8px 0 0',
                borderBottom: activeReport === tab.id ? '2px solid #007bff' : 'none'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p>Generating reports...</p>
          </div>
        ) : (
          <div>
            {/* Overview Tab */}
            {activeReport === 'overview' && (
              <div>
                <h3>Business Overview</h3>
                
                {/* Key Metrics */}
                <div className="grid grid-4" style={{ marginBottom: '30px' }}>
                  <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}>
                    <div style={{ color: 'white', padding: '10px' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                        ${reportData.salesByCategory.reduce((sum, cat) => sum + cat.revenue, 0).toFixed(2)}
                      </div>
                      <div>Total Revenue</div>
                    </div>
                  </div>

                  <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #4ECDC4, #44A08D)' }}>
                    <div style={{ color: 'white', padding: '10px' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                        {reportData.ordersByStatus.reduce((sum, status) => sum + status.count, 0)}
                      </div>
                      <div>Total Orders</div>
                    </div>
                  </div>

                  <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #45B7D1, #96C93D)' }}>
                    <div style={{ color: 'white', padding: '10px' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                        {reportData.salesByProduct.reduce((sum, product) => sum + product.unitsSold, 0)}
                      </div>
                      <div>Units Sold</div>
                    </div>
                  </div>

                  <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #F7DC6F, #BB8FCE)' }}>
                    <div style={{ color: 'white', padding: '10px' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                        {reportData.lowStockProducts.length}
                      </div>
                      <div>Low Stock Items</div>
                    </div>
                  </div>
                </div>

                {/* Sales by Category */}
                <div className="grid grid-2">
                  <div>
                    <h4>Sales by Category</h4>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {reportData.salesByCategory.map((category, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '15px',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.5rem' }}>{getCategoryEmoji(category.category)}</span>
                            <div>
                              <div style={{ fontWeight: '600' }}>{category.category}</div>
                              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                {category.orders} orders • {category.products} products
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', color: '#007bff' }}>
                              ${category.revenue.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4>Orders by Status</h4>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {reportData.ordersByStatus.map((status, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '15px',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                            {status.status}
                          </div>
                          <div>
                            <span className="badge badge-info">{status.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sales Analysis Tab */}
            {activeReport === 'sales' && (
              <div>
                <h3>Sales Analysis</h3>
                
                <div className="grid grid-2">
                  <div>
                    <h4>Revenue by Date</h4>
                    {reportData.revenueByDate.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#6c757d', padding: '40px' }}>
                        No revenue data for selected period
                      </p>
                    ) : (
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {reportData.revenueByDate.map((day, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px',
                            borderBottom: '1px solid #e9ecef'
                          }}>
                            <div>
                              <div style={{ fontWeight: '600' }}>
                                {new Date(day.date).toLocaleDateString()}
                              </div>
                              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                {day.orders} orders
                              </div>
                            </div>
                            <div style={{ fontWeight: '600', color: '#007bff' }}>
                              ${day.revenue.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4>Top Selling Products</h4>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {reportData.topProducts.map((product, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '15px',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>{product.product}</div>
                            <div style={{ fontSize: '14px', color: '#6c757d' }}>
                              {product.category} • Stock: {product.currentStock}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', color: '#28a745' }}>
                              {product.unitsSold} sold
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Performance Tab */}
            {activeReport === 'products' && (
              <div>
                <h3>Product Performance</h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                        <th>Average Price</th>
                        <th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.salesByProduct.map((product, index) => (
                        <tr key={index}>
                          <td style={{ fontWeight: '600' }}>{product.product}</td>
                          <td>{product.unitsSold}</td>
                          <td style={{ color: '#007bff', fontWeight: '600' }}>
                            ${product.revenue.toFixed(2)}
                          </td>
                          <td>${product.averagePrice.toFixed(2)}</td>
                          <td>
                            <div style={{ 
                              width: '100px', 
                              height: '8px', 
                              background: '#e9ecef', 
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${Math.min(100, (product.unitsSold / Math.max(...reportData.salesByProduct.map(p => p.unitsSold))) * 100)}%`,
                                height: '100%',
                                background: index < 3 ? '#28a745' : index < 6 ? '#ffc107' : '#6c757d',
                                borderRadius: '4px'
                              }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Inventory Status Tab */}
            {activeReport === 'inventory' && (
              <div>
                <h3>Inventory Status</h3>
                
                {reportData.lowStockProducts.length === 0 ? (
                  <div className="alert alert-success">
                    <span>✅</span>
                    All products are well stocked!
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    <span>⚠️</span>
                    {reportData.lowStockProducts.length} products are running low on stock
                  </div>
                )}

                <h4>Low Stock Products</h4>
                {reportData.lowStockProducts.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6c757d', padding: '40px' }}>
                    No low stock products found
                  </p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Current Stock</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.lowStockProducts.map((product, index) => (
                          <tr key={index}>
                            <td style={{ fontWeight: '600' }}>{product.product}</td>
                            <td>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {getCategoryEmoji(product.category)}
                                {product.category}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                color: product.currentStock === 0 ? '#dc3545' : product.currentStock < 5 ? '#fd7e14' : '#ffc107',
                                fontWeight: '600'
                              }}>
                                {product.currentStock}
                              </span>
                            </td>
                            <td>${product.price.toFixed(2)}</td>
                            <td>
                              <span className={`badge badge-${
                                product.currentStock === 0 ? 'danger' : 
                                product.currentStock < 5 ? 'warning' : 
                                'warning'
                              }`}>
                                {product.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-primary btn-sm">
                                📦 Restock
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
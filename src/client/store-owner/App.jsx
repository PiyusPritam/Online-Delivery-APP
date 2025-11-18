import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import ProductManager from './components/ProductManager.jsx';
import OrderManager from './components/OrderManager.jsx';
import Reports from './components/Reports.jsx';
import './App.css';

export default function StoreOwnerApp({ onBackToMain, integratedMode = true }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize the app
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManager />;
      case 'orders':
        return <OrderManager />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="modern-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2 className="loading-title">Loading Store Dashboard...</h2>
          <p className="loading-subtitle">Preparing your management tools</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-store-app">
      {/* Modern Navigation Sidebar */}
      <nav className="store-sidebar">
        <div className="sidebar-header">
          <div className="store-logo">
            <div className="logo-icon">🏪</div>
            <div className="logo-text">
              <span className="store-title">Store Dashboard</span>
              <span className="store-subtitle">Management Center</span>
            </div>
          </div>
        </div>

        <div className="nav-menu">
          {[
            { 
              id: 'dashboard', 
              label: 'Overview', 
              icon: '📊',
              description: 'Sales & Analytics',
              color: '#3b82f6'
            },
            { 
              id: 'products', 
              label: 'Products', 
              icon: '📦',
              description: 'Inventory Management', 
              color: '#059669'
            },
            { 
              id: 'orders', 
              label: 'Orders', 
              icon: '🛒',
              description: 'Order Processing',
              color: '#dc2626'
            },
            { 
              id: 'reports', 
              label: 'Reports', 
              icon: '📈',
              description: 'Business Insights',
              color: '#7c3aed'
            }
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
              style={{ '--item-color': item.color }}
            >
              <div className="nav-item-icon">{item.icon}</div>
              <div className="nav-item-content">
                <span className="nav-item-label">{item.label}</span>
                <span className="nav-item-description">{item.description}</span>
              </div>
              <div className="nav-item-indicator"></div>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="store-stats">
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <div className="stat-info">
                <span className="stat-label">Active</span>
                <span className="stat-value">24/7</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="store-main">
        <div className="main-content">
          {renderCurrentView()}
        </div>
      </main>

      <style jsx>{`
        .modern-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .loading-content {
          text-align: center;
        }

        .loading-spinner {
          width: 64px;
          height: 64px;
          border: 6px solid rgba(255, 255, 255, 0.2);
          border-top: 6px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }

        .loading-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .loading-subtitle {
          opacity: 0.8;
          margin: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .modern-store-app {
          display: grid;
          grid-template-columns: 280px 1fr;
          min-height: 100vh;
          background: #f8fafc;
        }

        .store-sidebar {
          background: white;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 16px rgba(0, 0, 0, 0.04);
        }

        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .store-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }

        .logo-text {
          flex: 1;
        }

        .store-title {
          display: block;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.3;
        }

        .store-subtitle {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
          line-height: 1.3;
        }

        .nav-menu {
          flex: 1;
          padding: 20px 0;
        }

        .nav-item {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 4px;
        }

        .nav-item:hover {
          background: #f8fafc;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          color: var(--item-color);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--item-color);
          border-radius: 0 4px 4px 0;
        }

        .nav-item-icon {
          width: 40px;
          height: 40px;
          background: #f3f4f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.2s ease;
        }

        .nav-item.active .nav-item-icon {
          background: var(--item-color);
          color: white;
          transform: scale(1.1);
        }

        .nav-item-content {
          flex: 1;
        }

        .nav-item-label {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1f2937;
          line-height: 1.3;
        }

        .nav-item-description {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.3;
        }

        .nav-item.active .nav-item-label {
          color: var(--item-color);
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .store-stats {
          background: #f8fafc;
          padding: 16px;
          border-radius: 12px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          font-size: 1.5rem;
        }

        .stat-info {
          flex: 1;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-value {
          display: block;
          font-size: 1rem;
          color: #1f2937;
          font-weight: 700;
        }

        .store-main {
          background: #f8fafc;
          overflow-y: auto;
        }

        .main-content {
          padding: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .modern-store-app {
            grid-template-columns: 1fr;
          }
          
          .store-sidebar {
            display: none;
          }
          
          .main-content {
            padding: 20px;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
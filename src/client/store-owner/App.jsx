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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Loading Store Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className={`store-owner-app ${integratedMode ? 'integrated-store' : ''}`}>
      {/* Header - only show if not in integrated mode */}
      {!integratedMode && (
        <header className="store-header">
          <div className="header-content">
            <div className="header-left">
              <h1>🏪 Store Owner Dashboard</h1>
              <p>Manage your Quick Delivery store</p>
            </div>
            <div className="header-right">
              <div className="user-info">
                <span>👤 Store Manager</span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Navigation */}
      <nav className={`store-nav ${integratedMode ? 'integrated-nav' : ''}`}>
        <div className="nav-content">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'products', label: 'Products', icon: '📦' },
            { id: 'orders', label: 'Orders', icon: '🛒' },
            { id: 'reports', label: 'Reports', icon: '📈' }
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="store-main">
        {renderCurrentView()}
      </main>
    </div>
  );
}
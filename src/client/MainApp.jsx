import React, { useState, useEffect } from 'react';
import DeliveryApp from './app.jsx'; // Customer app
import StoreOwnerApp from './store-owner/App.jsx'; // Store owner app
import './MainApp.css';

export default function MainApp() {
  const [currentMode, setCurrentMode] = useState('landing'); // 'landing', 'customer', 'store'
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Detect user context and initialize
    detectUserContext();
  }, []);

  const detectUserContext = async () => {
    try {
      // Wait a moment for ServiceNow globals to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get user information
      const user = {
        name: window.g_user?.userName || 'User',
        roles: ['customer', 'store_manager'] // Mock roles, in real app would check actual roles
      };
      
      setUserInfo(user);
    } catch (error) {
      console.error('Error detecting user context:', error);
      setUserInfo({ name: 'Guest', roles: ['customer'] });
    } finally {
      setLoading(false);
    }
  };

  const handleModeSelect = (mode) => {
    setCurrentMode(mode);
  };

  const handleBackToLanding = () => {
    setCurrentMode('landing');
  };

  if (loading) {
    return (
      <div className="main-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>🚚 Loading Quick Delivery...</h2>
          <p>Preparing your delivery experience</p>
        </div>
      </div>
    );
  }

  // Customer App Mode
  if (currentMode === 'customer') {
    return (
      <div className="integrated-app">
        {/* Mode Switcher Header */}
        <div className="mode-switcher">
          <div className="mode-switcher-content">
            <button 
              className="back-btn"
              onClick={handleBackToLanding}
            >
              ← Back to Main
            </button>
            
            <div className="current-mode">
              <span className="mode-icon">🛒</span>
              <span className="mode-text">Customer Shopping</span>
            </div>
            
            {userInfo.roles.includes('store_manager') && (
              <button 
                className="switch-mode-btn"
                onClick={() => handleModeSelect('store')}
              >
                🏪 Switch to Store Management
              </button>
            )}
          </div>
        </div>
        
        {/* Customer App */}
        <div className="app-content">
          <DeliveryApp onBackToMain={handleBackToLanding} />
        </div>
      </div>
    );
  }

  // Store Owner App Mode
  if (currentMode === 'store') {
    return (
      <div className="integrated-app">
        {/* Mode Switcher Header */}
        <div className="mode-switcher store-mode">
          <div className="mode-switcher-content">
            <button 
              className="back-btn"
              onClick={handleBackToLanding}
            >
              ← Back to Main
            </button>
            
            <div className="current-mode">
              <span className="mode-icon">🏪</span>
              <span className="mode-text">Store Management</span>
            </div>
            
            <button 
              className="switch-mode-btn"
              onClick={() => handleModeSelect('customer')}
            >
              🛒 Switch to Customer View
            </button>
          </div>
        </div>
        
        {/* Store Owner App */}
        <div className="app-content">
          <StoreOwnerApp onBackToMain={handleBackToLanding} />
        </div>
      </div>
    );
  }

  // Landing Page
  return (
    <div className="main-app-landing">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              🚚 Quick Delivery
            </h1>
            <p className="hero-subtitle">
              Your complete delivery solution - shop for groceries or manage your store
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Delivery</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">Fast</span>
                <span className="stat-label">Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mode-selection">
        <div className="mode-selection-content">
          <h2>Choose Your Experience</h2>
          <p>Select how you'd like to use Quick Delivery</p>
          
          <div className="mode-cards">
            {/* Customer Mode Card */}
            <div 
              className="mode-card customer-card"
              onClick={() => handleModeSelect('customer')}
            >
              <div className="mode-card-content">
                <div className="mode-icon-large">🛒</div>
                <h3>Shop for Groceries</h3>
                <p>Browse products, add to cart, and get everything delivered to your door</p>
                
                <div className="mode-features">
                  <div className="feature-item">✅ Browse Categories</div>
                  <div className="feature-item">✅ Search Products</div>
                  <div className="feature-item">✅ Track Orders</div>
                  <div className="feature-item">✅ Manage Profile</div>
                </div>
                
                <button className="mode-button customer-button">
                  <span>Start Shopping</span>
                  <span className="button-arrow">→</span>
                </button>
              </div>
            </div>

            {/* Store Owner Mode Card */}
            {userInfo.roles.includes('store_manager') && (
              <div 
                className="mode-card store-card"
                onClick={() => handleModeSelect('store')}
              >
                <div className="mode-card-content">
                  <div className="mode-icon-large">🏪</div>
                  <h3>Manage Your Store</h3>
                  <p>Control inventory, process orders, and view analytics for your business</p>
                  
                  <div className="mode-features">
                    <div className="feature-item">✅ Product Management</div>
                    <div className="feature-item">✅ Order Processing</div>
                    <div className="feature-item">✅ Sales Reports</div>
                    <div className="feature-item">✅ Inventory Control</div>
                  </div>
                  
                  <button className="mode-button store-button">
                    <span>Access Dashboard</span>
                    <span className="button-arrow">→</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="user-welcome">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <div className="user-name">Welcome, {userInfo.name}!</div>
              <div className="user-role">
                {userInfo.roles.includes('store_manager') 
                  ? 'Store Manager & Customer' 
                  : 'Valued Customer'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-content">
          <h2>Why Choose Quick Delivery?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Same-day delivery available for most items</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Fresh Products</h3>
              <p>Quality guaranteed with fresh, organic options</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Secure Payments</h3>
              <p>Multiple payment options with secure checkout</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Easy to Use</h3>
              <p>Intuitive interface designed for everyone</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Accurate Tracking</h3>
              <p>Real-time order tracking and notifications</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Premium Service</h3>
              <p>Exceptional customer support and satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="app-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span>🚚 Quick Delivery</span>
          </div>
          <div className="footer-text">
            <p>Delivering convenience to your doorstep since 2024</p>
            <p>© Quick Delivery Services. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import DeliveryApp from './app.jsx'; // Customer app
import StoreOwnerApp from './store-owner/App.jsx'; // Store owner app
import Login from './components/Login.jsx'; // Login component
import Header from './components/Header.jsx'; // Header component
import { UserService } from './services/UserService.js';
import './MainApp.css';

export default function MainApp() {
  const [currentMode, setCurrentMode] = useState('loading'); // 'loading', 'auth', 'landing', 'customer', 'store'
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  
  const userService = new UserService();

  useEffect(() => {
    // Initialize the app
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('MainApp: Initializing application...');
      
      // Wait for ServiceNow environment to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to get authenticated user
      try {
        const user = await userService.getCurrentUser();
        console.log('MainApp: Found user:', user);
        
        if (user && user.sys_id) {
          // Get user roles
          const roles = await userService.getUserRoles(user.sys_id);
          const userData = {
            ...user,
            roles: roles,
            name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()
          };
          
          console.log('MainApp: User with roles:', userData);
          
          setUserInfo(userData);
          setCurrentMode('landing');
        } else {
          console.log('MainApp: No authenticated user found, showing auth');
          setCurrentMode('auth');
        }
      } catch (authError) {
        console.log('MainApp: Authentication failed, showing login:', authError.message);
        setCurrentMode('auth');
      }
      
    } catch (error) {
      console.error('MainApp: Initialization error:', error);
      setError('Failed to initialize application. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (userData) => {
    console.log('MainApp: Login successful:', userData);
    
    try {
      // Get user roles if not already set
      if (!userData.roles) {
        const roles = await userService.getUserRoles(userData.sys_id);
        userData.roles = roles;
      }
      
      setUserInfo(userData);
      setCurrentMode('landing');
      setError(null);
    } catch (error) {
      console.error('MainApp: Error processing login:', error);
      setUserInfo(userData);
      setCurrentMode('landing');
    }
  };

  const handleLoginError = (error) => {
    console.error('MainApp: Login error:', error);
    setError(error.message || 'Login failed. Please try again.');
  };

  const handleModeSelect = (mode) => {
    console.log('MainApp: Mode selected:', mode);
    setCurrentMode(mode);
  };

  const handleBackToLanding = () => {
    setCurrentMode('landing');
  };

  const handleLogout = () => {
    console.log('MainApp: Logging out user');
    userService.logout();
    setUserInfo(null);
    setCurrentMode('auth');
  };

  const hasRole = (role) => {
    return userInfo?.roles?.includes(role) || false;
  };

  // Loading state
  if (loading || currentMode === 'loading') {
    return (
      <div className="main-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>🚚 Loading Quick Delivery...</h2>
          <p>Detecting your ServiceNow session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="main-error">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => {
              setError(null);
              initializeApp();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Authentication flow
  if (currentMode === 'auth' || !userInfo) {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    );
  }

  // Main app with header
  return (
    <div className="main-app-container">
      {/* Header */}
      <Header 
        userInfo={userInfo}
        onLogout={handleLogout}
        currentMode={currentMode}
        onModeChange={handleModeSelect}
        onBackToLanding={handleBackToLanding}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Customer App Mode */}
        {currentMode === 'customer' && (
          <div className="app-view">
            <DeliveryApp onBackToMain={handleBackToLanding} />
          </div>
        )}

        {/* Store Owner App Mode */}
        {currentMode === 'store' && (
          <div className="app-view">
            <StoreOwnerApp onBackToMain={handleBackToLanding} />
          </div>
        )}

        {/* Landing Page */}
        {currentMode === 'landing' && (
          <div className="main-app-landing">
            {/* Hero Section */}
            <div className="hero-section">
              <div className="hero-content">
                <div className="hero-text">
                  <h1 className="hero-title">
                    Welcome back, {userInfo.first_name || 'User'}! 🎉
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
                <p>Select how you'd like to use Quick Delivery today</p>
                
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
                        <div className="feature-item">✅ Browse Indian Products</div>
                        <div className="feature-item">✅ Search & Filter</div>
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
                  {hasRole('x_1599224_online_d.store_manager') && (
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

                {/* User Status */}
                <div className="user-status">
                  <div className="status-card">
                    <div className="status-icon">
                      {hasRole('x_1599224_online_d.delivery_admin') 
                        ? '👑' 
                        : hasRole('x_1599224_online_d.store_manager') 
                        ? '🏪' 
                        : '🛒'}
                    </div>
                    <div className="status-details">
                      <div className="status-title">
                        {hasRole('x_1599224_online_d.delivery_admin') 
                          ? 'System Administrator Access' 
                          : hasRole('x_1599224_online_d.store_manager') 
                          ? 'Store Manager & Customer Access' 
                          : 'Customer Access'}
                      </div>
                      <div className="status-subtitle">
                        You have access to {hasRole('x_1599224_online_d.store_manager') ? 'both shopping and store management' : 'shopping features'}
                      </div>
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
                    <h3>Fresh Indian Products</h3>
                    <p>Quality guaranteed with fresh, authentic Indian groceries</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">💳</div>
                    <h3>Secure Payments</h3>
                    <p>Multiple payment options with secure checkout in ₹</p>
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
        )}
      </div>
    </div>
  );
}
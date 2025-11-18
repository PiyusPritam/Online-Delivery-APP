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
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    const saved = localStorage.getItem('freshcart-dark-mode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const userService = new UserService();

  useEffect(() => {
    // Initialize the app
    initializeApp();
    
    // Apply dark mode on load
    document.documentElement.classList.toggle('dark-mode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, []);

  useEffect(() => {
    // Apply dark mode changes
    document.documentElement.classList.toggle('dark-mode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('freshcart-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const initializeApp = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('FreshCart: Initializing application...');
      
      // Wait for ServiceNow environment to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to get authenticated user
      try {
        const user = await userService.getCurrentUser();
        console.log('FreshCart: Found user:', user);
        
        if (user && user.sys_id) {
          // Get user roles
          const roles = await userService.getUserRoles(user.sys_id);
          const userData = {
            ...user,
            roles: roles,
            name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()
          };
          
          console.log('FreshCart: User with roles:', userData);
          
          setUserInfo(userData);
          setCurrentMode('landing');
        } else {
          console.log('FreshCart: No authenticated user found, showing auth');
          setCurrentMode('auth');
        }
      } catch (authError) {
        console.log('FreshCart: Authentication failed, showing login:', authError.message);
        setCurrentMode('auth');
      }
      
    } catch (error) {
      console.error('FreshCart: Initialization error:', error);
      setError('Failed to initialize FreshCart. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (userData) => {
    console.log('FreshCart: Login successful:', userData);
    
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
      console.error('FreshCart: Error processing login:', error);
      setUserInfo(userData);
      setCurrentMode('landing');
    }
  };

  const handleLoginError = (error) => {
    console.error('FreshCart: Login error:', error);
    setError(error.message || 'Login failed. Please try again.');
  };

  const handleModeSelect = (mode) => {
    console.log('FreshCart: Mode selected:', mode);
    setCurrentMode(mode);
  };

  const handleBackToLanding = () => {
    setCurrentMode('landing');
  };

  const handleLogout = () => {
    console.log('FreshCart: Logging out user');
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
      <div className={`main-loading ${darkMode ? 'dark-mode' : ''}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>🛒 Loading FreshCart...</h2>
          <p>Your premium grocery delivery experience awaits</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`main-error ${darkMode ? 'dark-mode' : ''}`}>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
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
      <div className={darkMode ? 'dark-mode' : ''}>
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onError={handleLoginError}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      </div>
    );
  }

  // Main app with header
  return (
    <div className={`main-app-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <Header 
        userInfo={userInfo}
        onLogout={handleLogout}
        currentMode={currentMode}
        onModeChange={handleModeSelect}
        onBackToLanding={handleBackToLanding}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Customer App Mode */}
        {currentMode === 'customer' && (
          <div className="app-view">
            <DeliveryApp onBackToMain={handleBackToLanding} darkMode={darkMode} />
          </div>
        )}

        {/* Store Owner App Mode */}
        {currentMode === 'store' && (
          <div className="app-view">
            <StoreOwnerApp onBackToMain={handleBackToLanding} darkMode={darkMode} />
          </div>
        )}

        {/* ULTRA-REDESIGNED LANDING PAGE - MODERN HOME */}
        {currentMode === 'landing' && (
          <div className="freshcart-homepage">
            
            {/* Ultra-Modern Hero Section */}
            <section className="homepage-hero">
              <div className="hero-container">
                <div className="hero-left">
                  <div className="hero-badge">
                    <span className="badge-icon">🚀</span>
                    <span>Welcome to FreshCart Premium</span>
                  </div>
                  <h1 className="hero-heading">
                    Hello <span className="user-name">{userInfo.first_name || 'there'}</span>! 
                    <br />Ready for <span className="gradient-text">Ultra-Fresh Groceries</span>?
                  </h1>
                  <p className="hero-description">
                    Experience India's most advanced grocery delivery ecosystem. 
                    Premium organic products, AI-powered recommendations, lightning-fast delivery, 
                    and unmatched quality - all in one revolutionary platform.
                  </p>
                  
                  <div className="hero-actions">
                    <button 
                      className="hero-btn primary"
                      onClick={() => handleModeSelect('customer')}
                    >
                      <span>🛒</span>
                      Start Shopping Now
                    </button>
                    {hasRole('x_1599224_online_d.store_manager') && (
                      <button 
                        className="hero-btn secondary"
                        onClick={() => handleModeSelect('store')}
                      >
                        <span>📊</span>
                        View Dashboard
                      </button>
                    )}
                  </div>
                </div>

                <div className="hero-right">
                  <div className="hero-visual">
                    <div className="visual-grid">
                      <div className="visual-item item-1">🥭</div>
                      <div className="visual-item item-2">🥬</div>
                      <div className="visual-item item-3">🥛</div>
                      <div className="visual-item item-4">🌶️</div>
                      <div className="visual-item item-5">🍅</div>
                      <div className="visual-item item-6">🧅</div>
                    </div>
                    <div className="visual-background"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ultra-Enhanced Stats Section */}
            <section className="stats-showcase">
              <div className="stats-container">
                <div className="stats-grid">
                  <div className="stat-block">
                    <div className="stat-icon">📦</div>
                    <div className="stat-number">2,500+</div>
                    <div className="stat-label">Premium Products</div>
                    <div className="stat-desc">Carefully curated organic selection</div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-number">15 min</div>
                    <div className="stat-label">Ultra-Fast Delivery</div>
                    <div className="stat-desc">AI-optimized logistics network</div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-icon">🌟</div>
                    <div className="stat-number">4.9★</div>
                    <div className="stat-label">Customer Rating</div>
                    <div className="stat-desc">99.8% satisfaction guarantee</div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-number">24/7</div>
                    <div className="stat-label">AI Support</div>
                    <div className="stat-desc">Instant help, anytime</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ultra-Modern Services Section */}
            <section className="services-section">
              <div className="services-container">
                <div className="section-header">
                  <h2 className="section-title">Your Premium FreshCart Experience</h2>
                  <p className="section-subtitle">Choose your preferred interaction mode and unlock the full potential of modern grocery shopping</p>
                </div>

                <div className="services-grid">
                  <div 
                    className="service-card customer-service"
                    onClick={() => handleModeSelect('customer')}
                  >
                    <div className="service-header">
                      <div className="service-icon">🛒</div>
                      <div className="service-badge">Most Popular</div>
                    </div>
                    <h3 className="service-title">Smart Grocery Shopping</h3>
                    <p className="service-description">
                      Discover our AI-powered shopping experience with personalized recommendations, 
                      organic product catalog, and ultra-fast delivery to your doorstep
                    </p>
                    <div className="service-features">
                      <div className="feature-pill">✅ 2,500+ Organic Products</div>
                      <div className="feature-pill">✅ 15-Min Ultra Delivery</div>
                      <div className="feature-pill">✅ AI Recommendations</div>
                      <div className="feature-pill">✅ Multi-Address Support</div>
                    </div>
                    <button className="service-button">
                      <span>Start Shopping Experience</span>
                      <svg className="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {hasRole('x_1599224_online_d.store_manager') && (
                    <div 
                      className="service-card store-service"
                      onClick={() => handleModeSelect('store')}
                    >
                      <div className="service-header">
                        <div className="service-icon">🏪</div>
                        <div className="service-badge manager">Manager Portal</div>
                      </div>
                      <h3 className="service-title">Advanced Store Management</h3>
                      <p className="service-description">
                        Complete business intelligence suite with real-time analytics, 
                        inventory automation, order orchestration, and customer insights dashboard
                      </p>
                      <div className="service-features">
                        <div className="feature-pill">✅ Smart Inventory</div>
                        <div className="feature-pill">✅ Real-time Analytics</div>
                        <div className="feature-pill">✅ Order Automation</div>
                        <div className="feature-pill">✅ Customer Intelligence</div>
                      </div>
                      <button className="service-button store-btn">
                        <span>Access Management Portal</span>
                        <svg className="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Ultra-Enhanced Features Showcase */}
            <section className="features-showcase">
              <div className="features-container">
                <div className="section-header">
                  <h2 className="section-title">Why FreshCart is Revolutionary?</h2>
                  <p className="section-subtitle">The future of grocery delivery, powered by cutting-edge technology and unwavering quality commitment</p>
                </div>

                <div className="features-grid">
                  <div className="feature-block premium">
                    <div className="feature-visual">
                      <div className="feature-icon-large">⚡</div>
                      <div className="feature-background lightning"></div>
                    </div>
                    <div className="feature-content">
                      <h3 className="feature-title">AI-Powered Ultra Delivery</h3>
                      <p className="feature-description">
                        Revolutionary 15-minute delivery powered by machine learning route optimization, 
                        predictive inventory management, and real-time demand forecasting. 
                        Our AI system ensures the fastest, most efficient delivery experience possible.
                      </p>
                      <div className="feature-metrics">
                        <div className="metric">
                          <span className="metric-number">15min</span>
                          <span className="metric-label">Ultra Delivery</span>
                        </div>
                        <div className="metric">
                          <span className="metric-number">99.8%</span>
                          <span className="metric-label">On-time Rate</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="feature-block quality">
                    <div className="feature-visual">
                      <div className="feature-icon-large">🌱</div>
                      <div className="feature-background organic"></div>
                    </div>
                    <div className="feature-content">
                      <h3 className="feature-title">Certified Organic Excellence</h3>
                      <p className="feature-description">
                        Direct partnerships with 1,000+ certified organic farms across India. 
                        Blockchain-verified supply chain ensures complete traceability from farm to your table. 
                        Every product undergoes rigorous quality testing and freshness validation.
                      </p>
                      <div className="feature-metrics">
                        <div className="metric">
                          <span className="metric-number">1,000+</span>
                          <span className="metric-label">Organic Farms</span>
                        </div>
                        <div className="metric">
                          <span className="metric-number">100%</span>
                          <span className="metric-label">Quality Certified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="feature-block technology">
                    <div className="feature-visual">
                      <div className="feature-icon-large">📱</div>
                      <div className="feature-background smart"></div>
                    </div>
                    <div className="feature-content">
                      <h3 className="feature-title">Next-Gen Smart Experience</h3>
                      <p className="feature-description">
                        Advanced AI recommendations learn your preferences, dietary needs, and shopping patterns. 
                        Voice ordering, smart shopping lists, predictive restocking, and personalized nutrition insights 
                        make grocery shopping effortless and intelligent.
                      </p>
                      <div className="feature-metrics">
                        <div className="metric">
                          <span className="metric-number">AI</span>
                          <span className="metric-label">Powered</span>
                        </div>
                        <div className="metric">
                          <span className="metric-number">Smart</span>
                          <span className="metric-label">Experience</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Enhanced User Account Section */}
            <section className="account-section">
              <div className="account-container">
                <div className="account-card">
                  <div className="account-header">
                    <div className="account-avatar">
                      <span>{userInfo.first_name?.charAt(0) || 'U'}{userInfo.last_name?.charAt(0) || ''}</span>
                    </div>
                    <div className="account-info">
                      <h3 className="account-name">{userInfo.first_name} {userInfo.last_name}</h3>
                      <p className="account-email">{userInfo.email || userInfo.user_name}</p>
                      <div className="account-role">
                        <span className="role-badge">
                          <span className="role-icon">
                            {hasRole('x_1599224_online_d.delivery_admin') 
                              ? '👑' 
                              : hasRole('x_1599224_online_d.store_manager') 
                              ? '🏪' 
                              : '💎'}
                          </span>
                          <span>
                            {hasRole('x_1599224_online_d.delivery_admin') 
                              ? 'System Administrator' 
                              : hasRole('x_1599224_online_d.store_manager') 
                              ? 'Store Manager' 
                              : 'Premium Member'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="account-permissions">
                    <h4 className="permissions-title">Your Access Privileges</h4>
                    <div className="permissions-list">
                      <div className="permission-item enabled">
                        <span className="permission-icon">🛒</span>
                        <span className="permission-text">Premium Shopping Access</span>
                        <span className="permission-status">✅</span>
                      </div>
                      
                      {hasRole('x_1599224_online_d.store_manager') && (
                        <div className="permission-item enabled">
                          <span className="permission-icon">🏪</span>
                          <span className="permission-text">Store Management Portal</span>
                          <span className="permission-status">✅</span>
                        </div>
                      )}
                      
                      {hasRole('x_1599224_online_d.delivery_admin') && (
                        <div className="permission-item enabled">
                          <span className="permission-icon">👑</span>
                          <span className="permission-text">System Administration</span>
                          <span className="permission-status">✅</span>
                        </div>
                      )}
                      
                      <div className="permission-item enabled">
                        <span className="permission-icon">🎯</span>
                        <span className="permission-text">AI Personalization</span>
                        <span className="permission-status">✅</span>
                      </div>
                      
                      <div className="permission-item enabled">
                        <span className="permission-icon">⚡</span>
                        <span className="permission-text">Ultra-Fast Delivery</span>
                        <span className="permission-status">✅</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ultra-Enhanced Call to Action Section */}
            <section className="cta-section">
              <div className="cta-container">
                <div className="cta-content">
                  <h2 className="cta-title">Ready to Experience the Future of Grocery Shopping?</h2>
                  <p className="cta-subtitle">
                    Join over 100,000 satisfied customers who have revolutionized their grocery shopping 
                    experience with FreshCart's cutting-edge platform and premium service
                  </p>
                  <div className="cta-actions">
                    <button 
                      className="cta-button primary"
                      onClick={() => handleModeSelect('customer')}
                    >
                      <span>🛒</span>
                      Begin Shopping Journey
                    </button>
                    <button className="cta-button secondary">
                      <span>💬</span>
                      Contact Premium Support
                    </button>
                  </div>
                </div>
                
                <div className="cta-stats">
                  <div className="cta-stat">
                    <div className="stat-emoji">😍</div>
                    <div className="stat-text">99.8% Customer Satisfaction</div>
                  </div>
                  <div className="cta-stat">
                    <div className="stat-emoji">🚀</div>
                    <div className="stat-text">150,000+ Orders Delivered</div>
                  </div>
                  <div className="cta-stat">
                    <div className="stat-emoji">⭐</div>
                    <div className="stat-text">4.9/5 Premium Rating</div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}
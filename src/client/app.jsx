import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import Cart from './components/Cart.jsx';
import OrderHistory from './components/OrderHistory.jsx';
import UserProfile from './components/UserProfile.jsx';
import OrderTracking from './components/OrderTracking.jsx';
import Login from './components/Login.jsx';
import { UserService } from './services/UserService.js';
import './app.css';

// Error Boundary Component with enhanced error display
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ 
              background: '#ffebee', 
              color: '#c62828', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #ffcdd2',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: '0 0 15px 0' }}>❌ Application Error</h2>
              <p style={{ margin: '0 0 15px 0' }}>
                Something went wrong with the delivery application. This is usually a temporary issue.
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔄 Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App({ onBackToMain, integratedMode = true }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('products');
  const [cart, setCart] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log('APP DEBUG:', message);
    setDebugInfo(prev => [...prev, `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    addDebugInfo('App component mounted');
    
    // In integrated mode, skip authentication as the parent already handles it
    if (integratedMode) {
      setLoading(false);
    } else {
      initializeApp();
    }
  }, [integratedMode]);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);

  const initializeApp = async () => {
    try {
      addDebugInfo('Starting app initialization');
      setError('');
      setAuthError(null);
      
      // Enhanced environment check
      if (typeof window === 'undefined') {
        throw new Error('Window object not available - app must run in browser environment');
      }
      
      addDebugInfo(`Environment: ${window.location.href}`);
      addDebugInfo(`User Agent: ${navigator.userAgent.substring(0, 100)}...`);
      
      // Check if we're in ServiceNow context
      const isServiceNowContext = window.location.href.includes('service-now.com') || 
                                 window.location.href.includes('servicenow.com') ||
                                 !!window.g_user || 
                                 !!window.NOW;
                                 
      addDebugInfo(`ServiceNow context detected: ${isServiceNowContext}`);
      
      if (!isServiceNowContext) {
        addDebugInfo('WARNING: Not in ServiceNow context - authentication may fail');
      }
      
      const userService = new UserService();
      addDebugInfo('UserService created');
      
      try {
        const user = await userService.getCurrentUser();
        addDebugInfo(`User fetched: ${user ? 'Success' : 'Failed'}`);
        
        if (user) {
          const userName = typeof user.name === 'object' ? user.name.display_value : user.name;
          const userNameFull = typeof user.user_name === 'object' ? user.user_name.display_value : user.user_name;
          
          addDebugInfo(`User authenticated: ${userName || userNameFull || 'Unknown user'}`);
          setCurrentUser(user);
        } else {
          throw new Error('Authentication returned no user data');
        }
      } catch (userError) {
        addDebugInfo(`User authentication failed: ${userError.message}`);
        
        // Store authentication errors for the login component
        setAuthError({
          message: userError.message,
          details: userService.getAuthErrors ? userService.getAuthErrors() : [],
          timestamp: new Date().toLocaleString()
        });
        
        // Don't throw here - let the Login component handle it
        setCurrentUser(null);
      }
      
    } catch (err) {
      const errorMessage = `App initialization failed: ${err.message}`;
      console.error(errorMessage, err);
      addDebugInfo(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      addDebugInfo('App initialization complete');
    }
  };

  const addToCart = (product, quantity) => {
    try {
      const productName = typeof product.name === 'object' ? product.name.display_value : product.name;
      addDebugInfo(`Adding to cart: ${productName || 'Unknown product'} (${quantity})`);
      
      setCart(prev => {
        const productId = typeof product.sys_id === 'object' ? product.sys_id.value : product.sys_id;
        const existing = prev.find(item => {
          const itemId = typeof item.product.sys_id === 'object' ? item.product.sys_id.value : item.product.sys_id;
          return itemId === productId;
        });
        
        if (existing) {
          return prev.map(item => {
            const itemId = typeof item.product.sys_id === 'object' ? item.product.sys_id.value : item.product.sys_id;
            return itemId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item;
          });
        }
        return [...prev, { product, quantity }];
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      addDebugInfo(`Error adding to cart: ${err.message}`);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        setCart(prev => prev.filter(item => {
          const itemId = typeof item.product.sys_id === 'object' ? item.product.sys_id.value : item.product.sys_id;
          return itemId !== productId;
        }));
      } else {
        setCart(prev =>
          prev.map(item => {
            const itemId = typeof item.product.sys_id === 'object' ? item.product.sys_id.value : item.product.sys_id;
            return itemId === productId
              ? { ...item, quantity: newQuantity }
              : item;
          })
        );
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      addDebugInfo(`Error updating cart: ${err.message}`);
    }
  };

  const clearCart = () => {
    addDebugInfo('Cart cleared');
    setCart([]);
  };

  const renderCurrentView = () => {
    try {
      switch (currentView) {
        case 'products':
          return <ProductGrid onAddToCart={addToCart} />;
        case 'cart':
          return (
            <Cart
              cart={cart}
              onUpdateQuantity={updateCartQuantity}
              onClearCart={clearCart}
              currentUser={currentUser}
            />
          );
        case 'orders':
          return <OrderHistory currentUser={currentUser} />;
        case 'profile':
          return <UserProfile currentUser={currentUser} onUpdateUser={setCurrentUser} />;
        case 'tracking':
          return <OrderTracking currentUser={currentUser} />;
        default:
          return <ProductGrid onAddToCart={addToCart} />;
      }
    } catch (err) {
      console.error('Error rendering view:', err);
      return (
        <div style={{ 
          padding: '20px', 
          background: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px',
          margin: '20px'
        }}>
          <h3>❌ View Rendering Error</h3>
          <p>Error loading the {currentView} view: {err.message}</p>
          <button
            onClick={() => setCurrentView('products')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Return to Products
          </button>
        </div>
      );
    }
  };

  // Show loading state during initialization
  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1>🚚 Quick Delivery</h1>
            <p>Loading application...</p>
            <div className="spinner" style={{ 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #007bff',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              animation: 'spin 2s linear infinite',
              margin: '10px auto'
            }}></div>
          </div>
          
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Show app initialization error
  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #ffcdd2',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: '0 0 15px 0' }}>❌ Application Error</h2>
            <p style={{ margin: '0 0 15px 0' }}>{error}</p>
            <button
              onClick={initializeApp}
              style={{
                padding: '10px 20px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              🔄 Retry Initialization
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ↻ Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show login if no current user and not in integrated mode
  if (!currentUser && !integratedMode) {
    return (
      <ErrorBoundary>
        <Login 
          onLogin={setCurrentUser} 
          debugInfo={debugInfo}
          authError={authError}
        />
      </ErrorBoundary>
    );
  }

  // Main app interface
  return (
    <ErrorBoundary>
      <div className="delivery-app">
        {/* Only show header if NOT in integrated mode */}
        {!integratedMode && (
          <Header
            currentUser={currentUser}
            currentView={currentView}
            onViewChange={setCurrentView}
            cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            integratedMode={integratedMode}
            onBackToMain={onBackToMain}
          />
        )}

        {/* Secondary Navigation for Integrated Mode */}
        {integratedMode && (
          <div className="customer-nav">
            <div className="customer-nav-container">
              <div className="nav-title">
                <span className="nav-icon">🛒</span>
                <span className="nav-text">Customer Shopping Portal</span>
              </div>
              
              <div className="nav-tabs">
                {[
                  { id: 'products', label: 'Browse Products', icon: '🏪' },
                  { id: 'cart', label: 'Shopping Cart', icon: '🛒', badge: cart.reduce((sum, item) => sum + item.quantity, 0) },
                  { id: 'orders', label: 'Order History', icon: '📦' },
                  { id: 'tracking', label: 'Track Orders', icon: '🚚' },
                  { id: 'profile', label: 'My Profile', icon: '👤' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`nav-tab ${currentView === tab.id ? 'active' : ''}`}
                    onClick={() => setCurrentView(tab.id)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                    {tab.badge > 0 && <span className="tab-badge">{tab.badge}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <main className={`main-content ${integratedMode ? 'integrated' : ''}`}>
          {renderCurrentView()}
        </main>
      </div>
    </ErrorBoundary>
  );
}
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

// Error Boundary Component
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
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap', background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
            <summary>Error Details</summary>
            <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
            <p><strong>Stack:</strong> {this.state.errorInfo.componentStack}</p>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('products');
  const [cart, setCart] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebugInfo = (message) => {
    console.log('DEBUG:', message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addDebugInfo('App component mounted');
    initializeApp();
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);

  const initializeApp = async () => {
    try {
      addDebugInfo('Starting app initialization');
      
      // Check if we're in ServiceNow environment
      if (typeof window === 'undefined') {
        throw new Error('Window object not available');
      }
      
      addDebugInfo('Window object available');
      
      // Wait for ServiceNow globals
      addDebugInfo('Waiting for ServiceNow globals...');
      await waitForServiceNowGlobals();
      
      addDebugInfo('ServiceNow globals ready');
      addDebugInfo(`g_user: ${window.g_user ? 'Available' : 'Not available'}`);
      addDebugInfo(`g_ck: ${window.g_ck ? 'Available' : 'Not available'}`);
      
      const userService = new UserService();
      addDebugInfo('UserService created');
      
      const user = await userService.getCurrentUser();
      addDebugInfo(`User fetched: ${user ? 'Success' : 'Failed'}`);
      
      if (user) {
        addDebugInfo(`User name: ${user.name || 'No name'}`);
        setCurrentUser(user);
      }
      
    } catch (err) {
      const errorMessage = `Initialization failed: ${err.message}`;
      console.error(errorMessage, err);
      addDebugInfo(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      addDebugInfo('Initialization complete');
    }
  };

  const waitForServiceNowGlobals = () => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 10 seconds max
      
      const checkGlobals = () => {
        attempts++;
        addDebugInfo(`Checking globals attempt ${attempts}/${maxAttempts}`);
        
        if (window.g_user && window.g_ck) {
          addDebugInfo('ServiceNow globals found!');
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('ServiceNow globals not available after 10 seconds'));
        } else {
          setTimeout(checkGlobals, 200);
        }
      };
      
      checkGlobals();
    });
  };

  const addToCart = (product, quantity) => {
    try {
      addDebugInfo(`Adding to cart: ${product.name || 'Unknown product'}`);
      setCart(prev => {
        const existing = prev.find(item => item.product.sys_id === product.sys_id);
        if (existing) {
          return prev.map(item =>
            item.product.sys_id === product.sys_id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
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
        setCart(prev => prev.filter(item => item.product.sys_id !== productId));
      } else {
        setCart(prev =>
          prev.map(item =>
            item.product.sys_id === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      addDebugInfo(`Error updating cart: ${err.message}`);
    }
  };

  const clearCart = () => setCart([]);

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
        <div className="alert alert-error">
          Error loading view: {err.message}
        </div>
      );
    }
  };

  // Show debug information if there's an error or still loading
  if (loading || error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>🚚 Quick Delivery</h1>
        
        {loading && (
          <div>
            <p>Loading application...</p>
            <div className="spinner" style={{ 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              animation: 'spin 2s linear infinite',
              margin: '10px 0'
            }}></div>
          </div>
        )}
        
        {error && (
          <div style={{ background: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
            <h3>Error:</h3>
            <p>{error}</p>
          </div>
        )}
        
        <details style={{ marginTop: '20px' }}>
          <summary>Debug Information ({debugInfo.length} entries)</summary>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px', 
            marginTop: '10px',
            maxHeight: '300px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {debugInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
        </details>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <ErrorBoundary>
        <Login onLogin={setCurrentUser} debugInfo={debugInfo} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="delivery-app">
        <Header
          currentUser={currentUser}
          currentView={currentView}
          onViewChange={setCurrentView}
          cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
        <main className="main-content">
          {renderCurrentView()}
        </main>
      </div>
    </ErrorBoundary>
  );
}
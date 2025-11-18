import React, { useState, useEffect } from 'react';
import { UserService } from '../services/UserService.js';

const Login = ({ onLoginSuccess, onError }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  
  const userService = new UserService();

  // Auto-login check on mount
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      setLoading(true);
      const user = await userService.getCurrentUser();
      if (user && user.sys_id && user.sys_id !== 'guest') {
        console.log('Login: Found existing authenticated user:', user);
        
        // Determine user roles and redirect appropriately
        const userRoles = await getUserRoles(user.sys_id);
        onLoginSuccess({
          ...user,
          roles: userRoles,
          name: user.name || `${user.first_name} ${user.last_name}`
        });
      }
    } catch (error) {
      console.log('Login: No existing authentication found:', error.message);
      // This is expected for unauthenticated users, so no error handling needed
    } finally {
      setLoading(false);
    }
  };

  const getUserRoles = async (userId) => {
    // In a real implementation, this would query the user's roles
    // For demo purposes, we'll determine based on user data or use defaults
    try {
      // Try to determine roles based on user ID pattern or email
      if (window.g_user?.email) {
        const email = window.g_user.email.toLowerCase();
        if (email.includes('admin')) {
          return ['x_1599224_online_d.customer', 'x_1599224_online_d.store_manager', 'x_1599224_online_d.delivery_admin'];
        } else if (email.includes('manager')) {
          return ['x_1599224_online_d.customer', 'x_1599224_online_d.store_manager'];
        }
      }
      
      // Default to customer role
      return ['x_1599224_online_d.customer'];
    } catch (error) {
      console.log('Login: Error determining user roles:', error);
      return ['x_1599224_online_d.customer'];
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let user;
      
      if (isLogin) {
        // Login process
        user = await userService.mockLogin(formData.email, formData.password);
        console.log('Login: Login successful:', user);
      } else {
        // Signup process
        user = await userService.mockSignup({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        });
        console.log('Login: Signup successful:', user);
      }

      // Get user roles
      const userRoles = await getUserRoles(user.sys_id);
      
      // Prepare user data for parent component
      const userData = {
        ...user,
        roles: userRoles,
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()
      };

      console.log('Login: Prepared user data:', userData);
      onLoginSuccess(userData);

    } catch (error) {
      console.error('Login: Authentication failed:', error);
      setErrors({
        submit: error.message || 'Authentication failed. Please try again.'
      });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type) => {
    const demoCredentials = {
      customer: {
        email: 'customer@demo.com',
        password: 'demo123'
      },
      manager: {
        email: 'manager@demo.com',
        password: 'demo123'
      },
      admin: {
        email: 'admin@demo.com',
        password: 'admin123'
      }
    };

    const credentials = demoCredentials[type];
    setFormData(prev => ({
      ...prev,
      email: credentials.email,
      password: credentials.password
    }));
    setErrors({});
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-content">
          <div className="login-loading">
            <div className="loading-spinner"></div>
            <h2>🚚 Quick Delivery</h2>
            <p>{isLogin ? 'Signing you in...' : 'Creating your account...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Hero Section */}
        <div className="login-hero">
          <div className="hero-content">
            <h1 className="hero-title">🚚 Quick Delivery</h1>
            <p className="hero-subtitle">
              Fresh groceries and essentials delivered to your doorstep
            </p>
            <div className="hero-features">
              <div className="feature">⚡ Fast Delivery</div>
              <div className="feature">🌱 Fresh Products</div>
              <div className="feature">💳 Secure Payments</div>
            </div>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="login-form-section">
          <div className="login-form-container">
            <div className="form-header">
              <h2>{isLogin ? 'Welcome Back!' : 'Join Quick Delivery'}</h2>
              <p>{isLogin ? 'Sign in to your account' : 'Create your account to get started'}</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {!isLogin && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? 'error' : ''}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? 'error' : ''}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter your email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Enter your password"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              )}

              {errors.submit && (
                <div className="error-message submit-error">{errors.submit}</div>
              )}

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Demo Accounts */}
            {isLogin && (
              <div className="demo-accounts">
                <p className="demo-title">Try Demo Accounts:</p>
                <div className="demo-buttons">
                  <button 
                    type="button" 
                    className="demo-btn customer-demo"
                    onClick={() => fillDemoCredentials('customer')}
                  >
                    🛒 Customer Demo
                  </button>
                  <button 
                    type="button" 
                    className="demo-btn manager-demo"
                    onClick={() => fillDemoCredentials('manager')}
                  >
                    🏪 Manager Demo
                  </button>
                  <button 
                    type="button" 
                    className="demo-btn admin-demo"
                    onClick={() => fillDemoCredentials('admin')}
                  >
                    👑 Admin Demo
                  </button>
                </div>
              </div>
            )}

            {/* Toggle between Login/Signup */}
            <div className="form-toggle">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  className="toggle-button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({
                      email: '',
                      password: '',
                      firstName: '',
                      lastName: '',
                      phone: ''
                    });
                    setErrors({});
                  }}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
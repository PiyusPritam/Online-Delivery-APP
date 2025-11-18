import React, { useState, useEffect } from 'react';
import { UserService } from '../services/UserService.js';

export default function Login({ onLogin, debugInfo = [] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [globalsReady, setGlobalsReady] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [localDebugInfo, setLocalDebugInfo] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const addDebugInfo = (message) => {
    console.log('LOGIN DEBUG:', message);
    setLocalDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const userService = new UserService();

  // Check for ServiceNow globals availability
  useEffect(() => {
    addDebugInfo('Login component mounted');
    addDebugInfo('Checking for ServiceNow globals...');
    
    const checkGlobals = () => {
      addDebugInfo(`Checking globals - g_user: ${!!window.g_user}, g_ck: ${!!window.g_ck}`);
      
      if (window.g_user && window.g_ck) {
        addDebugInfo(`Found globals - userName: ${window.g_user.userName}, userID: ${window.g_user.userID}`);
        setGlobalsReady(true);
        setCurrentUserName(window.g_user.userName || 'Unknown');
      } else {
        addDebugInfo('Globals not ready, retrying in 200ms...');
        setTimeout(checkGlobals, 200);
      }
    };
    
    checkGlobals();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    addDebugInfo('Form submitted');

    try {
      addDebugInfo('Getting current user...');
      // First get the current ServiceNow user
      const user = await userService.getCurrentUser();
      addDebugInfo(`User service response: ${user ? 'Success' : 'No user returned'}`);
      
      if (!user) {
        throw new Error('Unable to authenticate user - no user data returned');
      }

      addDebugInfo(`User data received: ${JSON.stringify(user, null, 2)}`);

      // Check if customer profile exists
      const userId = typeof user.sys_id === 'object' ? user.sys_id.value : user.sys_id;
      addDebugInfo(`Checking customer profile for user ID: ${userId}`);
      
      let customerProfile = await userService.getCustomerProfile(userId);
      addDebugInfo(`Customer profile: ${customerProfile ? 'Found' : 'Not found'}`);

      if (!customerProfile && isNewUser) {
        addDebugInfo('Creating new customer profile...');
        // Create new customer profile
        customerProfile = await userService.createCustomerProfile({
          user_id: userId,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          active: true
        });
        addDebugInfo('Customer profile created successfully');
      }

      if (!customerProfile) {
        addDebugInfo('No customer profile - switching to new user mode');
        setIsNewUser(true);
        setError('Please complete your profile to continue');
        return;
      }

      addDebugInfo('Login successful - calling onLogin');
      // Success - user is logged in with customer profile
      onLogin({ ...user, customerProfile });
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      addDebugInfo(`Login error: ${errorMessage}`);
      console.error('Login error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while waiting for ServiceNow globals
  if (!globalsReady) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1>🚚 Quick Delivery</h1>
            <p>Initializing application...</p>
            <div style={{ 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              animation: 'spin 2s linear infinite',
              margin: '10px auto'
            }}></div>
          </div>

          <details style={{ marginTop: '20px' }}>
            <summary>Initialization Debug Info ({localDebugInfo.length + debugInfo.length} entries)</summary>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px', 
              marginTop: '10px',
              maxHeight: '200px',
              overflow: 'auto',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              {[...debugInfo, ...localDebugInfo].map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          </details>

          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <strong>Environment Check:</strong>
            <div>• Window object: {typeof window !== 'undefined' ? '✓' : '✗'}</div>
            <div>• g_user: {typeof window !== 'undefined' && window.g_user ? '✓' : '✗'}</div>
            <div>• g_ck: {typeof window !== 'undefined' && window.g_ck ? '✓' : '✗'}</div>
            <div>• Location: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1>🚚 Quick Delivery</h1>
          <p>Welcome! Please {isNewUser ? 'complete your profile' : 'sign in'} to continue</p>
        </div>

        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          {isNewUser && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isNewUser ? 'Complete Profile' : 'Continue')}
          </button>
        </form>

        <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
          <p>Logged in as: <strong>{currentUserName}</strong></p>
        </div>

        <details style={{ marginTop: '20px' }}>
          <summary>Login Debug Info ({localDebugInfo.length} entries)</summary>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px', 
            marginTop: '10px',
            maxHeight: '200px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {localDebugInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
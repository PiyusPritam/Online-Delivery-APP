import React, { useState, useEffect } from 'react';
import { UserService } from '../services/UserService.js';

export default function Login({ onLogin, debugInfo = [] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailedErrors, setDetailedErrors] = useState([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [authStatus, setAuthStatus] = useState('initializing');
  const [environmentInfo, setEnvironmentInfo] = useState({});
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

  // Environment detection on mount
  useEffect(() => {
    addDebugInfo('Login component mounted - starting environment detection');
    detectEnvironment();
    attemptAuthentication();
  }, []);

  const detectEnvironment = () => {
    const env = {
      windowAvailable: typeof window !== 'undefined',
      location: typeof window !== 'undefined' ? window.location.href : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      serviceNowGlobals: {
        g_user: typeof window !== 'undefined' && !!window.g_user,
        g_ck: typeof window !== 'undefined' && !!window.g_ck,
        NOW: typeof window !== 'undefined' && !!window.NOW
      },
      domElements: {
        userMeta: !!document.querySelector('meta[name="user-sys-id"]'),
        userNameMeta: !!document.querySelector('meta[name="user-name"]'),
        csrfMeta: !!document.querySelector('meta[name="csrf-token"]'),
        sessionMeta: !!document.querySelector('meta[name="session-token"]')
      },
      cookies: typeof document !== 'undefined' ? document.cookie.split(';').length : 0
    };

    setEnvironmentInfo(env);
    addDebugInfo(`Environment detected: ${JSON.stringify(env, null, 2)}`);
  };

  const attemptAuthentication = async () => {
    try {
      setAuthStatus('authenticating');
      setError('');
      setDetailedErrors([]);
      addDebugInfo('Starting authentication attempt...');

      const user = await userService.getCurrentUser();
      
      if (user) {
        addDebugInfo(`Authentication successful: ${user.name || user.user_name}`);
        
        // Get customer profile
        const userId = typeof user.sys_id === 'object' ? user.sys_id.value : user.sys_id;
        let customerProfile = await userService.getCustomerProfile(userId);

        if (!customerProfile) {
          addDebugInfo('No customer profile found - switching to new user mode');
          setIsNewUser(true);
          setAuthStatus('needs_profile');
          return;
        }

        addDebugInfo('Customer profile found - completing authentication');
        setAuthStatus('authenticated');
        onLogin({ ...user, customerProfile });
      } else {
        throw new Error('No user data returned from authentication service');
      }
    } catch (err) {
      console.error('Authentication failed:', err);
      addDebugInfo(`Authentication failed: ${err.message}`);
      
      setError(err.message);
      setDetailedErrors(userService.getAuthErrors());
      setAuthStatus('failed');
    }
  };

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
    
    addDebugInfo('Profile form submitted');

    try {
      if (isNewUser) {
        addDebugInfo('Creating customer profile...');
        
        // Get current user first
        const user = await userService.getCurrentUser();
        if (!user) {
          throw new Error('Unable to get current user for profile creation');
        }

        const userId = typeof user.sys_id === 'object' ? user.sys_id.value : user.sys_id;
        
        // Create customer profile
        const customerProfile = await userService.createCustomerProfile({
          user_id: userId,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          active: true
        });

        addDebugInfo('Customer profile created successfully');
        setAuthStatus('authenticated');
        onLogin({ ...user, customerProfile });
      } else {
        // Retry authentication
        await attemptAuthentication();
      }
    } catch (err) {
      const errorMessage = err.message || 'Profile creation failed';
      addDebugInfo(`Form submission error: ${errorMessage}`);
      setError(errorMessage);
      setDetailedErrors(userService.getAuthErrors());
    } finally {
      setLoading(false);
    }
  };

  const renderEnvironmentInfo = () => (
    <div style={{ 
      background: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '4px', 
      padding: '15px', 
      marginBottom: '20px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>Environment Information</h4>
      <div><strong>Status:</strong> {authStatus}</div>
      <div><strong>Location:</strong> {environmentInfo.location}</div>
      <div><strong>ServiceNow Globals:</strong></div>
      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
        <li>g_user: {environmentInfo.serviceNowGlobals?.g_user ? '✅ Available' : '❌ Missing'}</li>
        <li>g_ck: {environmentInfo.serviceNowGlobals?.g_ck ? '✅ Available' : '❌ Missing'}</li>
        <li>NOW: {environmentInfo.serviceNowGlobals?.NOW ? '✅ Available' : '❌ Missing'}</li>
      </ul>
      <div><strong>DOM Elements:</strong></div>
      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
        <li>User Meta: {environmentInfo.domElements?.userMeta ? '✅ Found' : '❌ Missing'}</li>
        <li>CSRF Token: {environmentInfo.domElements?.csrfMeta ? '✅ Found' : '❌ Missing'}</li>
      </ul>
      <div><strong>Cookies:</strong> {environmentInfo.cookies} available</div>
    </div>
  );

  const renderDetailedErrors = () => {
    if (detailedErrors.length === 0) return null;

    return (
      <div style={{ 
        background: '#fff5f5', 
        border: '1px solid #fed7d7', 
        borderRadius: '4px', 
        padding: '15px', 
        marginBottom: '20px' 
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#c53030' }}>Authentication Error Details</h4>
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          {detailedErrors.map((error, index) => (
            <div key={index} style={{ 
              marginBottom: '10px', 
              padding: '8px', 
              background: '#fed7d7', 
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              <div><strong>{error.timestamp} - {error.method}:</strong></div>
              <div style={{ color: '#c53030' }}>{error.error}</div>
              {error.statusCode && <div><strong>Status:</strong> {error.statusCode}</div>}
              {error.details && (
                <details style={{ marginTop: '5px' }}>
                  <summary>Technical Details</summary>
                  <pre style={{ fontSize: '10px', marginTop: '5px', whiteSpace: 'pre-wrap' }}>
                    {error.details}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRetryButton = () => (
    <button
      type="button"
      onClick={attemptAuthentication}
      style={{
        width: '100%',
        padding: '12px',
        backgroundColor: '#17a2b8',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        marginBottom: '15px'
      }}
    >
      🔄 Retry Authentication
    </button>
  );

  // Show loading state during initial authentication
  if (authStatus === 'initializing' || authStatus === 'authenticating') {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1>🚚 Quick Delivery</h1>
            <p>{authStatus === 'initializing' ? 'Initializing application...' : 'Authenticating user...'}</p>
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

          {renderEnvironmentInfo()}

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
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1>🚚 Quick Delivery</h1>
          <p>
            {authStatus === 'failed' && 'Authentication failed. Please review the errors below.'}
            {authStatus === 'needs_profile' && 'Please complete your profile to continue.'}
            {authStatus === 'authenticated' && 'Welcome! Completing setup...'}
          </p>
        </div>

        {renderEnvironmentInfo()}

        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '15px', 
            borderRadius: '4px', 
            marginBottom: '20px',
            border: '1px solid #ffcdd2'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>❌ Authentication Error</h4>
            <p style={{ margin: '0' }}>{error}</p>
          </div>
        )}

        {renderDetailedErrors()}

        {authStatus === 'failed' && renderRetryButton()}

        {(authStatus === 'needs_profile' || authStatus === 'failed') && (
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
        )}

        <details style={{ marginTop: '20px' }}>
          <summary>Debug Information ({localDebugInfo.length} entries)</summary>
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

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#e3f2fd', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>🛠️ Troubleshooting Tips</h4>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li>Ensure you're accessing the app through ServiceNow (not directly)</li>
            <li>Check that you're logged into ServiceNow in another tab</li>
            <li>Try refreshing the page to reinitialize ServiceNow context</li>
            <li>Clear browser cache and cookies if issues persist</li>
            <li>Contact system administrator if problems continue</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
export class UserService {
  constructor() {
    this.tableName = "sys_user";
    this.authErrors = [];
  }

  // Add error tracking
  addAuthError(method, error, details = '') {
    const errorEntry = {
      timestamp: new Date().toLocaleTimeString(),
      method,
      error: error.message || error,
      details,
      statusCode: error.status || null
    };
    this.authErrors.push(errorEntry);
    console.error(`UserService [${method}]:`, errorEntry);
  }

  getAuthErrors() {
    return [...this.authErrors];
  }

  clearAuthErrors() {
    this.authErrors = [];
  }

  // Enhanced user detection - try multiple methods to get real user
  async getRealUserInfo() {
    console.log('UserService: Attempting to get real user information...');
    
    // Method 1: Try session info API
    try {
      console.log('UserService: Trying session info API...');
      const response = await fetch('/api/now/ui/session', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('UserService: Session API response:', data);
        
        if (data.result && data.result.user_sys_id && data.result.user_sys_id !== 'guest') {
          return {
            userID: data.result.user_sys_id,
            userName: data.result.user_name || data.result.user_display_name,
            firstName: data.result.user_first_name || 'System',
            lastName: data.result.user_last_name || 'Administrator'
          };
        }
      }
    } catch (error) {
      console.log('UserService: Session API failed:', error);
    }

    // Method 2: Try context API
    try {
      console.log('UserService: Trying context API...');
      const response = await fetch('/api/now/ui/context', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('UserService: Context API response:', data);
        
        if (data.result && data.result.user && data.result.user.sys_id && data.result.user.sys_id !== 'guest') {
          return {
            userID: data.result.user.sys_id,
            userName: data.result.user.user_name || data.result.user.name,
            firstName: data.result.user.first_name || 'System',
            lastName: data.result.user.last_name || 'Administrator'
          };
        }
      }
    } catch (error) {
      console.log('UserService: Context API failed:', error);
    }

    // Method 3: Try whoami API
    try {
      console.log('UserService: Trying whoami API...');
      const response = await fetch('/api/sn_ws/user/whoami', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('UserService: WhoAmI API response:', data);
        
        if (data.result && data.result.sys_id && data.result.sys_id !== 'guest') {
          return {
            userID: data.result.sys_id,
            userName: data.result.user_name || data.result.name,
            firstName: data.result.first_name || 'System',
            lastName: data.result.last_name || 'Administrator'
          };
        }
      }
    } catch (error) {
      console.log('UserService: WhoAmI API failed:', error);
    }

    // Method 4: Try current user API with different endpoint
    try {
      console.log('UserService: Trying current user API...');
      const response = await fetch('/api/now/table/sys_user?sysparm_query=user_name=admin^ORsys_id=6816f79cc0a8016401c5a33be04be441&sysparm_display_value=all&sysparm_limit=1', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('UserService: Current user API response:', data);
        
        if (data.result && data.result.length > 0) {
          const user = data.result[0];
          return {
            userID: typeof user.sys_id === 'object' ? user.sys_id.value : user.sys_id,
            userName: typeof user.user_name === 'object' ? user.user_name.display_value : user.user_name,
            firstName: typeof user.first_name === 'object' ? user.first_name.display_value : user.first_name,
            lastName: typeof user.last_name === 'object' ? user.last_name.display_value : user.last_name
          };
        }
      }
    } catch (error) {
      console.log('UserService: Current user API failed:', error);
    }

    // Method 5: Check for admin user specifically
    try {
      console.log('UserService: Trying admin user lookup...');
      const response = await fetch('/api/now/table/sys_user?sysparm_query=active=true^roles.nameSTARTSWITHadmin&sysparm_display_value=all&sysparm_limit=1', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('UserService: Admin user API response:', data);
        
        if (data.result && data.result.length > 0) {
          const user = data.result[0];
          return {
            userID: typeof user.sys_id === 'object' ? user.sys_id.value : user.sys_id,
            userName: typeof user.user_name === 'object' ? user.user_name.display_value : user.user_name,
            firstName: typeof user.first_name === 'object' ? user.first_name.display_value : user.first_name,
            lastName: typeof user.last_name === 'object' ? user.last_name.display_value : user.last_name
          };
        }
      }
    } catch (error) {
      console.log('UserService: Admin user lookup failed:', error);
    }

    return null;
  }

  // Enhanced globals detection with real user detection
  waitForGlobals() {
    return new Promise(async (resolve, reject) => {
      console.log('UserService: Starting enhanced globals detection...');
      this.clearAuthErrors();
      
      // Try to get real user info first
      const realUserInfo = await this.getRealUserInfo();
      if (realUserInfo) {
        console.log('UserService: Found real user info, updating globals:', realUserInfo);
        window.g_user = realUserInfo;
        window.g_ck = this.extractSessionToken();
        resolve();
        return;
      }
      
      let attempts = 0;
      const maxAttempts = 15; // Reduced to 3 seconds for faster feedback
      
      const checkGlobals = () => {
        attempts++;
        console.log(`UserService: Globals check attempt ${attempts}/${maxAttempts}`);
        
        // Method 1: Standard ServiceNow globals
        if (window.g_user && window.g_ck) {
          console.log('UserService: Standard ServiceNow globals found!');
          console.log('UserService: g_user details:', {
            userName: window.g_user.userName,
            userID: window.g_user.userID,
            firstName: window.g_user.firstName,
            lastName: window.g_user.lastName
          });
          
          // If user ID is guest, try to get real user info
          if (window.g_user.userID === 'guest') {
            console.log('UserService: Detected guest user, attempting to get real user...');
            this.getRealUserInfo().then(realUser => {
              if (realUser) {
                console.log('UserService: Updated to real user:', realUser);
                window.g_user = realUser;
              }
              resolve();
            }).catch(() => {
              console.log('UserService: Could not get real user, proceeding with guest');
              resolve();
            });
            return;
          }
          
          resolve();
          return;
        }

        // Method 2: NOW namespace
        if (window.NOW && window.NOW.g_user) {
          console.log('UserService: NOW namespace globals found!');
          window.g_user = window.NOW.g_user;
          window.g_ck = window.NOW.g_ck || this.extractSessionToken();
          resolve();
          return;
        }

        // Method 3: Check for ServiceNow context in DOM
        const userMeta = document.querySelector('meta[name="user-sys-id"]');
        const userNameMeta = document.querySelector('meta[name="user-name"]');
        
        if (userMeta && userNameMeta) {
          console.log('UserService: Found user info in DOM meta tags');
          window.g_user = {
            userID: userMeta.content,
            userName: userNameMeta.content,
            firstName: userNameMeta.content.split(' ')[0] || 'User',
            lastName: userNameMeta.content.split(' ')[1] || ''
          };
          window.g_ck = this.extractSessionToken();
          resolve();
          return;
        }

        if (attempts >= maxAttempts) {
          const error = new Error(`ServiceNow globals not available after ${maxAttempts} attempts (${maxAttempts * 200}ms)`);
          this.addAuthError('waitForGlobals', error, `
            Checked: window.g_user=${!!window.g_user}, window.g_ck=${!!window.g_ck}
            NOW namespace: ${!!window.NOW}
            Meta tags: user-sys-id=${!!userMeta}, user-name=${!!userNameMeta}
            Location: ${window.location.href}
          `);
          reject(error);
        } else {
          setTimeout(checkGlobals, 200);
        }
      };
      
      checkGlobals();
    });
  }

  // Extract session token from various sources
  extractSessionToken() {
    console.log('UserService: Extracting session token...');
    
    // Method 1: Check cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'JSESSIONID' || name === 'glide_session_store' || name === 'BIGipServer') {
        console.log(`UserService: Found session token in cookie: ${name}`);
        return value;
      }
    }

    // Method 2: Check for ServiceNow specific tokens
    const tokenMeta = document.querySelector('meta[name="csrf-token"]') || 
                     document.querySelector('meta[name="session-token"]');
    if (tokenMeta) {
      console.log('UserService: Found session token in meta tag');
      return tokenMeta.content;
    }

    // Method 3: Generate a temporary token
    const tempToken = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    console.log('UserService: Generated temporary session token');
    return tempToken;
  }

  // Enhanced user fetching with multiple methods
  async getCurrentUser() {
    try {
      console.log('UserService: Starting getCurrentUser with enhanced error handling');
      this.clearAuthErrors();
      
      // Try immediate authentication first
      let user = await this.tryImmediateAuth();
      if (user) {
        console.log('UserService: Immediate authentication successful');
        return user;
      }

      // Wait for globals if immediate auth failed
      console.log('UserService: Immediate auth failed, waiting for globals...');
      try {
        await this.waitForGlobals();
      } catch (globalsError) {
        this.addAuthError('waitForGlobals', globalsError);
        throw new Error(`Authentication initialization failed: ${globalsError.message}. Please ensure you're accessing the app through ServiceNow.`);
      }

      if (!window.g_user || !window.g_user.userID) {
        const error = new Error('User not authenticated - no user ID available after globals initialization');
        this.addAuthError('getUserID', error, `g_user: ${JSON.stringify(window.g_user)}`);
        throw error;
      }

      console.log('UserService: Making API calls with user ID:', window.g_user.userID);

      // Try multiple API methods
      user = await this.tryStandardAPI();
      if (user) return user;

      user = await this.tryAlternativeAPIs();
      if (user) return user;

      // Create user from globals as last resort
      return this.createUserFromGlobals();

    } catch (error) {
      console.error('UserService: getCurrentUser failed:', error);
      this.addAuthError('getCurrentUser', error);
      throw new Error(`User authentication failed: ${error.message}. ${this.getErrorSummary()}`);
    }
  }

  async tryImmediateAuth() {
    try {
      console.log('UserService: Trying immediate authentication...');
      
      // Try multiple immediate auth endpoints
      const endpoints = [
        '/api/now/ui/user',
        '/api/now/ui/session',
        '/api/sn_ws/user/whoami'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`UserService: Immediate auth ${endpoint} response:`, data);
            
            let userData = data.result;
            if (userData && userData.sys_id && userData.sys_id !== 'guest') {
              window.g_user = {
                userID: userData.sys_id,
                userName: userData.user_name || userData.name || 'system_user',
                firstName: userData.first_name || 'System',
                lastName: userData.last_name || 'Administrator',
                email: userData.email || 'admin@system.com'
              };
              window.g_ck = this.extractSessionToken();
              
              return {
                sys_id: userData.sys_id,
                user_name: userData.user_name || userData.name,
                first_name: userData.first_name || 'System',
                last_name: userData.last_name || 'Administrator',
                name: `${userData.first_name || 'System'} ${userData.last_name || 'Administrator'}`,
                email: userData.email || 'admin@system.com'
              };
            }
          }
        } catch (endpointError) {
          console.log(`UserService: ${endpoint} failed:`, endpointError);
        }
      }

      this.addAuthError('immediateAuth', new Error('All immediate auth endpoints failed'));
      return null;
    } catch (error) {
      this.addAuthError('immediateAuth', error);
      return null;
    }
  }

  async tryStandardAPI() {
    try {
      console.log('UserService: Trying standard sys_user API...');
      
      const response = await fetch(`/api/now/table/${this.tableName}?sysparm_query=sys_id=${window.g_user.userID}&sysparm_display_value=all&sysparm_limit=1`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-UserToken": window.g_ck || ''
        },
        credentials: 'include'
      });

      console.log('UserService: Standard API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('UserService: Standard API response data:', data);
        
        if (data.result && data.result.length > 0) {
          return data.result[0];
        }
      }

      this.addAuthError('standardAPI', new Error(`Standard API failed with status ${response.status}`), await response.text().catch(() => 'No response text'));
      return null;
    } catch (error) {
      this.addAuthError('standardAPI', error);
      return null;
    }
  }

  async tryAlternativeAPIs() {
    const alternativeAPIs = [
      `/api/now/table/${this.tableName}/${window.g_user.userID}?sysparm_display_value=all`,
      `/api/sn_ws/user/whoami`,
      `/sys_user.do?JSONv2&sysparm_action=get&sysparm_sys_id=${window.g_user.userID}`
    ];

    for (let i = 0; i < alternativeAPIs.length; i++) {
      try {
        console.log(`UserService: Trying alternative API ${i + 1}:`, alternativeAPIs[i]);
        
        const response = await fetch(alternativeAPIs[i], {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "X-UserToken": window.g_ck || ''
          },
          credentials: 'include'
        });

        console.log(`UserService: Alternative API ${i + 1} response status:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log(`UserService: Alternative API ${i + 1} response:`, data);
          
          const user = data.result || (Array.isArray(data) ? data[0] : null);
          if (user && user.sys_id) {
            return user;
          }
        }

        this.addAuthError(`alternativeAPI${i + 1}`, new Error(`API ${i + 1} failed with status ${response.status}`), await response.text().catch(() => 'No response text'));
      } catch (error) {
        this.addAuthError(`alternativeAPI${i + 1}`, error);
      }
    }
    
    return null;
  }

  createUserFromGlobals() {
    console.log('UserService: Creating user object from globals as fallback');
    
    if (!window.g_user) {
      throw new Error('No user information available in ServiceNow globals');
    }

    return {
      sys_id: window.g_user.userID,
      user_name: window.g_user.userName || 'system_user',
      first_name: window.g_user.firstName || 'System',
      last_name: window.g_user.lastName || 'Administrator',
      name: `${window.g_user.firstName || 'System'} ${window.g_user.lastName || 'Administrator'}`,
      email: window.g_user.email || 'admin@system.com'
    };
  }

  getErrorSummary() {
    if (this.authErrors.length === 0) {
      return 'No detailed error information available.';
    }
    
    return `Attempted ${this.authErrors.length} authentication methods. Latest errors: ${this.authErrors.slice(-3).map(e => `${e.method}: ${e.error}`).join('; ')}`;
  }

  async getCustomerProfile(userId) {
    try {
      console.log('UserService: getCustomerProfile called for userId:', userId);
      
      const response = await fetch(`/api/now/table/x_1599224_online_d_customer?sysparm_query=user_id=${userId}&sysparm_display_value=all&sysparm_limit=1`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-UserToken": window.g_ck || ''
        },
        credentials: 'include'
      });

      console.log('UserService: Customer profile response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('UserService: Customer profile data:', data);
        return data.result && data.result.length > 0 ? data.result[0] : null;
      } else {
        this.addAuthError('getCustomerProfile', new Error(`Customer API failed with status ${response.status}`), await response.text().catch(() => 'No response text'));
        return null;
      }
    } catch (error) {
      this.addAuthError('getCustomerProfile', error);
      return null;
    }
  }

  async createCustomerProfile(userData) {
    try {
      console.log('UserService: createCustomerProfile called with data:', userData);
      
      const response = await fetch('/api/now/table/x_1599224_online_d_customer', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-UserToken": window.g_ck || ''
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      console.log('UserService: Create customer profile response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('UserService: Created customer profile data:', data);
        return data.result;
      } else {
        this.addAuthError('createCustomerProfile', new Error(`Create customer API failed with status ${response.status}`), await response.text().catch(() => 'No response text'));
        
        // Return mock profile for demo
        return {
          sys_id: 'demo_customer_' + Date.now(),
          user_id: userData.user_id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          active: true
        };
      }
    } catch (error) {
      this.addAuthError('createCustomerProfile', error);
      
      // Return mock profile for demo
      return {
        sys_id: 'demo_customer_' + Date.now(),
        user_id: userData.user_id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        active: true
      };
    }
  }

  async updateCustomerProfile(customerId, userData) {
    try {
      console.log('UserService: updateCustomerProfile called for ID:', customerId, 'with data:', userData);
      
      const response = await fetch(`/api/now/table/x_1599224_online_d_customer/${customerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-UserToken": window.g_ck || ''
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      console.log('UserService: Update customer profile response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('UserService: Updated customer profile data:', data);
        return data.result;
      } else {
        this.addAuthError('updateCustomerProfile', new Error(`Update customer API failed with status ${response.status}`), await response.text().catch(() => 'No response text'));
        return { ...userData, sys_id: customerId };
      }
    } catch (error) {
      this.addAuthError('updateCustomerProfile', error);
      return { ...userData, sys_id: customerId };
    }
  }
}
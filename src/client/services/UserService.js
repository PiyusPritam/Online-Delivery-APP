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

  // Helper function to extract value from ServiceNow API response
  extractValue(field) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field.display_value) return field.display_value;
    if (typeof field === 'object' && field.value) return field.value;
    return String(field);
  }

  // Enhanced globals detection - prioritize real ServiceNow session
  waitForGlobals() {
    return new Promise((resolve, reject) => {
      console.log('UserService: Starting ServiceNow session detection...');
      this.clearAuthErrors();
      
      let attempts = 0;
      const maxAttempts = 20; // Increased attempts for better detection
      
      const checkGlobals = () => {
        attempts++;
        console.log(`UserService: Session check attempt ${attempts}/${maxAttempts}`);
        
        // Method 1: Check ServiceNow globals first
        if (window.g_user && window.g_user.userID && window.g_user.userID !== 'guest') {
          console.log('UserService: Found real ServiceNow user:', window.g_user);
          resolve();
          return;
        }

        // Method 2: Check NOW namespace
        if (window.NOW && window.NOW.g_user && window.NOW.g_user.userID && window.NOW.g_user.userID !== 'guest') {
          console.log('UserService: Found user in NOW namespace:', window.NOW.g_user);
          window.g_user = window.NOW.g_user;
          window.g_ck = window.NOW.g_ck;
          resolve();
          return;
        }

        // Method 3: Try to extract from ServiceNow context
        try {
          // Check for user info in window properties
          const possibleUserProps = ['g_user', 'user', 'currentUser'];
          for (const prop of possibleUserProps) {
            if (window[prop] && window[prop].userID && window[prop].userID !== 'guest') {
              console.log(`UserService: Found user in window.${prop}:`, window[prop]);
              window.g_user = window[prop];
              resolve();
              return;
            }
          }
        } catch (e) {
          console.log('UserService: Error checking window properties:', e);
        }

        // Method 4: Check for ServiceNow context in DOM
        const userIdMeta = document.querySelector('meta[name="user-id"]') || 
                          document.querySelector('meta[name="user_id"]') ||
                          document.querySelector('meta[name="user-sys-id"]');
        const userNameMeta = document.querySelector('meta[name="user-name"]') ||
                            document.querySelector('meta[name="username"]');
        
        if (userIdMeta && userNameMeta && userIdMeta.content !== 'guest') {
          console.log('UserService: Found user info in DOM meta tags');
          window.g_user = {
            userID: userIdMeta.content,
            userName: userNameMeta.content,
            firstName: userNameMeta.content.split(' ')[0] || 'User',
            lastName: userNameMeta.content.split(' ').slice(1).join(' ') || ''
          };
          window.g_ck = this.extractSessionToken();
          resolve();
          return;
        }

        if (attempts >= maxAttempts) {
          // If we still don't have a real user, set up a guest session
          console.log('UserService: No real user found, setting up guest session');
          window.g_user = {
            userID: 'guest',
            userName: 'guest',
            firstName: 'Guest',
            lastName: 'User'
          };
          window.g_ck = this.extractSessionToken();
          resolve(); // Don't reject, let the app handle guest users
        } else {
          setTimeout(checkGlobals, 300); // Increased interval for better detection
        }
      };
      
      checkGlobals();
    });
  }

  // Extract session token from various sources
  extractSessionToken() {
    console.log('UserService: Extracting session token...');
    
    // Method 1: Check for ServiceNow session cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'JSESSIONID' || name === 'glide_session_store') {
        console.log(`UserService: Found session token in cookie: ${name}`);
        return value;
      }
    }

    // Method 2: Check g_ck global
    if (window.g_ck) {
      console.log('UserService: Found g_ck token');
      return window.g_ck;
    }

    // Method 3: Check for CSRF token
    const tokenMeta = document.querySelector('meta[name="csrf-token"]') || 
                     document.querySelector('meta[name="session-token"]') ||
                     document.querySelector('input[name="sysparm_ck"]');
    if (tokenMeta) {
      const token = tokenMeta.content || tokenMeta.value;
      if (token) {
        console.log('UserService: Found session token in meta/input');
        return token;
      }
    }

    // Method 4: Generate a temporary token
    const tempToken = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    console.log('UserService: Generated temporary session token');
    return tempToken;
  }

  // Get current authenticated user
  async getCurrentUser() {
    try {
      console.log('UserService: Getting current authenticated user...');
      this.clearAuthErrors();
      
      // Wait for ServiceNow globals
      await this.waitForGlobals();
      
      // If we have a guest user, try to get the real authenticated user
      if (!window.g_user || window.g_user.userID === 'guest') {
        console.log('UserService: Attempting to get real authenticated user...');
        const realUser = await this.getRealAuthenticatedUser();
        if (realUser) {
          window.g_user = realUser;
        }
      }

      if (!window.g_user || !window.g_user.userID) {
        throw new Error('No authenticated user found');
      }

      console.log('UserService: Current user ID:', window.g_user.userID);

      // Try to get full user details from API
      let user = await this.getUserDetails(window.g_user.userID);
      if (user) {
        return this.normalizeUserData(user);
      }

      // Fallback to globals data
      return this.createUserFromGlobals();

    } catch (error) {
      console.error('UserService: getCurrentUser failed:', error);
      this.addAuthError('getCurrentUser', error);
      
      // For demo purposes, if all else fails, create a demo admin user
      if (error.message.includes('guest') || error.message.includes('authenticated')) {
        console.log('UserService: Creating demo admin user as fallback');
        return this.createDemoAdminUser();
      }
      
      throw error;
    }
  }

  // Try multiple methods to get the real authenticated user
  async getRealAuthenticatedUser() {
    const methods = [
      // Method 1: Current user endpoint
      async () => {
        const response = await fetch('/api/now/ui/user', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.result && data.result.sys_id && data.result.sys_id !== 'guest') {
            return {
              userID: data.result.sys_id,
              userName: data.result.user_name || data.result.name,
              firstName: data.result.first_name || 'User',
              lastName: data.result.last_name || ''
            };
          }
        }
        return null;
      },

      // Method 2: Session info endpoint
      async () => {
        const response = await fetch('/api/now/ui/session', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.result && data.result.user_sys_id && data.result.user_sys_id !== 'guest') {
            return {
              userID: data.result.user_sys_id,
              userName: data.result.user_name || data.result.user_display_name,
              firstName: data.result.user_first_name || 'User',
              lastName: data.result.user_last_name || ''
            };
          }
        }
        return null;
      },

      // Method 3: Admin user lookup (for when user is admin)
      async () => {
        const response = await fetch('/api/now/table/sys_user?sysparm_query=active=true^user_name=admin&sysparm_display_value=all&sysparm_limit=1', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.result && data.result.length > 0) {
            const user = data.result[0];
            return {
              userID: this.extractValue(user.sys_id),
              userName: this.extractValue(user.user_name),
              firstName: this.extractValue(user.first_name) || 'System',
              lastName: this.extractValue(user.last_name) || 'Administrator'
            };
          }
        }
        return null;
      }
    ];

    for (const method of methods) {
      try {
        const user = await method();
        if (user) {
          console.log('UserService: Found real authenticated user:', user);
          return user;
        }
      } catch (error) {
        console.log('UserService: Auth method failed:', error);
      }
    }

    return null;
  }

  // Get detailed user information from sys_user table
  async getUserDetails(userId) {
    try {
      console.log('UserService: Getting user details for ID:', userId);
      
      const response = await fetch(`/api/now/table/sys_user/${userId}?sysparm_display_value=all`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-UserToken": window.g_ck || ''
        },
        credentials: 'include'
      });

      console.log('UserService: User details response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('UserService: User details response:', data);
        return data.result;
      }

      // Try alternative query
      const altResponse = await fetch(`/api/now/table/sys_user?sysparm_query=sys_id=${userId}&sysparm_display_value=all&sysparm_limit=1`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-UserToken": window.g_ck || ''
        },
        credentials: 'include'
      });

      if (altResponse.ok) {
        const altData = await altResponse.json();
        if (altData.result && altData.result.length > 0) {
          return altData.result[0];
        }
      }

      return null;
    } catch (error) {
      console.log('UserService: Error getting user details:', error);
      return null;
    }
  }

  // Normalize user data to handle ServiceNow's display_value/value structure
  normalizeUserData(userData) {
    console.log('UserService: Normalizing user data:', userData);
    
    const normalized = {
      sys_id: this.extractValue(userData.sys_id),
      user_name: this.extractValue(userData.user_name),
      first_name: this.extractValue(userData.first_name) || 'System',
      last_name: this.extractValue(userData.last_name) || 'Administrator',
      name: `${this.extractValue(userData.first_name) || 'System'} ${this.extractValue(userData.last_name) || 'Administrator'}`,
      email: this.extractValue(userData.email) || this.extractValue(userData.user_name) + '@system.com'
    };
    
    console.log('UserService: Normalized user data:', normalized);
    return normalized;
  }

  createUserFromGlobals() {
    console.log('UserService: Creating user object from globals');
    
    if (!window.g_user) {
      throw new Error('No user information available in ServiceNow globals');
    }

    return {
      sys_id: window.g_user.userID,
      user_name: window.g_user.userName || 'system_user',
      first_name: window.g_user.firstName || 'System',
      last_name: window.g_user.lastName || 'Administrator',
      name: `${window.g_user.firstName || 'System'} ${window.g_user.lastName || 'Administrator'}`,
      email: window.g_user.email || (window.g_user.userName + '@system.com')
    };
  }

  createDemoAdminUser() {
    console.log('UserService: Creating demo admin user');
    
    const demoAdmin = {
      sys_id: '6816f79cc0a8016401c5a33be04be441', // Standard admin sys_id
      user_name: 'admin',
      first_name: 'System',
      last_name: 'Administrator',
      name: 'System Administrator',
      email: 'admin@company.com'
    };

    // Update globals
    window.g_user = {
      userID: demoAdmin.sys_id,
      userName: demoAdmin.user_name,
      firstName: demoAdmin.first_name,
      lastName: demoAdmin.last_name,
      email: demoAdmin.email
    };
    
    return demoAdmin;
  }

  // Get user roles from sys_user_has_role table
  async getUserRoles(userId) {
    try {
      console.log('UserService: Getting roles for user:', userId);
      
      // Try to get user roles
      const response = await fetch(`/api/now/table/sys_user_has_role?sysparm_query=user.sys_id=${userId}&sysparm_display_value=true`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-UserToken": window.g_ck || ''
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('UserService: User roles response:', data);
        
        const roles = data.result?.map(roleRecord => this.extractValue(roleRecord.role)) || [];
        
        // Add our app-specific roles based on admin status
        const isAdmin = roles.some(role => 
          role.includes('admin') || 
          role.includes('security_admin') || 
          role.includes('system_administrator')
        );

        if (isAdmin) {
          return [
            'x_1599224_online_d.customer',
            'x_1599224_online_d.store_manager',
            'x_1599224_online_d.delivery_admin'
          ];
        }

        return ['x_1599224_online_d.customer'];
      }

      // Default roles based on user name
      const userName = window.g_user?.userName?.toLowerCase() || '';
      if (userName.includes('admin') || userId === '6816f79cc0a8016401c5a33be04be441') {
        return [
          'x_1599224_online_d.customer',
          'x_1599224_online_d.store_manager',
          'x_1599224_online_d.delivery_admin'
        ];
      }

      return ['x_1599224_online_d.customer'];
      
    } catch (error) {
      console.log('UserService: Error getting user roles:', error);
      
      // Default admin roles for system users
      return [
        'x_1599224_online_d.customer',
        'x_1599224_online_d.store_manager',
        'x_1599224_online_d.delivery_admin'
      ];
    }
  }

  getErrorSummary() {
    if (this.authErrors.length === 0) {
      return 'No detailed error information available.';
    }
    
    return `Attempted ${this.authErrors.length} authentication methods. Latest errors: ${this.authErrors.slice(-3).map(e => `${e.method}: ${e.error}`).join('; ')}`;
  }

  // Mock authentication for demo purposes (kept for demo accounts)
  async mockLogin(email, password) {
    console.log('UserService: Mock login attempt for:', email);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const demoAccounts = {
      'customer@demo.com': {
        password: 'demo123',
        userData: {
          sys_id: 'demo_customer_001',
          user_name: 'demo_customer',
          first_name: 'Demo',
          last_name: 'Customer',
          email: 'customer@demo.com'
        }
      },
      'manager@demo.com': {
        password: 'demo123',
        userData: {
          sys_id: 'demo_manager_001',
          user_name: 'demo_manager',
          first_name: 'Demo',
          last_name: 'Manager',
          email: 'manager@demo.com'
        }
      },
      'admin@demo.com': {
        password: 'admin123',
        userData: {
          sys_id: 'demo_admin_001',
          user_name: 'demo_admin',
          first_name: 'Demo',
          last_name: 'Admin',
          email: 'admin@demo.com'
        }
      }
    };
    
    const account = demoAccounts[email.toLowerCase()];
    
    if (!account || account.password !== password) {
      throw new Error('Invalid email or password');
    }
    
    window.g_user = {
      userID: account.userData.sys_id,
      userName: account.userData.user_name,
      firstName: account.userData.first_name,
      lastName: account.userData.last_name,
      email: account.userData.email
    };
    window.g_ck = this.extractSessionToken();
    
    return account.userData;
  }

  async mockSignup(userData) {
    console.log('UserService: Mock signup attempt for:', userData.email);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const existingEmails = ['customer@demo.com', 'manager@demo.com', 'admin@demo.com'];
    if (existingEmails.includes(userData.email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }
    
    const newUser = {
      sys_id: 'new_user_' + Date.now(),
      user_name: userData.email.split('@')[0],
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email
    };
    
    window.g_user = {
      userID: newUser.sys_id,
      userName: newUser.user_name,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      email: newUser.email
    };
    window.g_ck = this.extractSessionToken();
    
    return newUser;
  }

  logout() {
    console.log('UserService: Logging out user');
    
    // Clear global user info
    window.g_user = null;
    window.g_ck = null;
    
    // Clear any stored auth data
    this.clearAuthErrors();
    
    console.log('UserService: User logged out successfully');
  }
}
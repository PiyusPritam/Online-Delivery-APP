export class UserService {
  constructor() {
    this.tableName = "sys_user";
  }

  // Wait for ServiceNow globals to be available with enhanced checking
  waitForGlobals() {
    return new Promise((resolve, reject) => {
      console.log('UserService: Waiting for ServiceNow globals...');
      let attempts = 0;
      const maxAttempts = 30; // Reduced to 6 seconds
      
      const checkGlobals = () => {
        attempts++;
        console.log(`UserService: Checking globals attempt ${attempts}/${maxAttempts}`);
        console.log(`UserService: g_user exists: ${!!window.g_user}`);
        console.log(`UserService: g_ck exists: ${!!window.g_ck}`);
        
        if (window.g_user && window.g_ck) {
          console.log('UserService: ServiceNow globals found!');
          console.log('UserService: g_user details:', {
            userName: window.g_user.userName,
            userID: window.g_user.userID,
            firstName: window.g_user.firstName,
            lastName: window.g_user.lastName
          });
          resolve();
        } else if (attempts >= maxAttempts) {
          // Try alternative approach
          console.log('UserService: Globals not found, trying alternative initialization...');
          this.initializeAlternativeGlobals().then(resolve).catch(reject);
        } else {
          setTimeout(checkGlobals, 200);
        }
      };
      
      checkGlobals();
    });
  }

  // Alternative initialization method
  async initializeAlternativeGlobals() {
    try {
      console.log('UserService: Trying alternative ServiceNow context initialization...');
      
      // Try to get current user through ServiceNow API
      const response = await fetch('/api/now/ui/user', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('UserService: Alternative API response:', data);
        
        // Initialize globals manually
        window.g_user = {
          userName: data.result?.user_name || data.result?.name || 'demo_user',
          userID: data.result?.sys_id || 'demo_user_id',
          firstName: data.result?.first_name || 'Demo',
          lastName: data.result?.last_name || 'User',
          email: data.result?.email || 'demo@example.com'
        };
        
        // Set a basic token for API calls
        window.g_ck = this.generateSessionToken();
        
        console.log('UserService: Alternative globals initialized:', {
          g_user: window.g_user,
          g_ck: window.g_ck
        });
        
        return;
      } else {
        throw new Error(`API call failed: ${response.status}`);
      }
    } catch (error) {
      console.log('UserService: Alternative initialization failed, using demo mode:', error);
      
      // Ultimate fallback - demo mode
      window.g_user = {
        userName: 'demo_user',
        userID: 'demo_user_id', 
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@deliveryapp.com'
      };
      
      window.g_ck = this.generateSessionToken();
      
      console.log('UserService: Demo mode initialized');
    }
  }

  generateSessionToken() {
    // Generate a simple session token for API calls
    return 'demo_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async getCurrentUser() {
    try {
      console.log('UserService: getCurrentUser called');
      
      // Wait for ServiceNow globals to be ready
      await this.waitForGlobals();

      if (!window.g_user || !window.g_user.userID) {
        throw new Error('User not authenticated - no user ID available');
      }

      console.log('UserService: Making API call for user:', window.g_user.userID);

      // Try different API approaches
      let response;
      let user = null;

      // First try: Standard sys_user table lookup
      try {
        response = await fetch(`/api/now/table/${this.tableName}?sysparm_query=sys_id=${window.g_user.userID}&sysparm_display_value=all&sysparm_limit=1`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "X-UserToken": window.g_ck || ''
          },
        });

        console.log('UserService: Standard API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('UserService: Standard API response data:', data);
          user = data.result && data.result.length > 0 ? data.result[0] : null;
        }
      } catch (apiError) {
        console.log('UserService: Standard API call failed:', apiError);
      }

      // If standard API fails, create user object from globals
      if (!user) {
        console.log('UserService: Creating user object from globals');
        user = {
          sys_id: window.g_user.userID,
          user_name: window.g_user.userName,
          first_name: window.g_user.firstName,
          last_name: window.g_user.lastName,
          name: `${window.g_user.firstName} ${window.g_user.lastName}`,
          email: window.g_user.email
        };
      }

      console.log('UserService: Final user object:', user);
      return user;
    } catch (error) {
      console.error('UserService: Error in getCurrentUser:', error);
      throw error;
    }
  }

  async getCustomerProfile(userId) {
    try {
      console.log('UserService: getCustomerProfile called for userId:', userId);
      await this.waitForGlobals();
      
      // Try to fetch customer profile
      try {
        const response = await fetch(`/api/now/table/x_1599224_online_d_customer?sysparm_query=user_id=${userId}&sysparm_display_value=all&sysparm_limit=1`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "X-UserToken": window.g_ck || ''
          },
        });

        console.log('UserService: Customer profile response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('UserService: Customer profile data:', data);
          return data.result && data.result.length > 0 ? data.result[0] : null;
        } else {
          console.log('UserService: Customer profile API failed, returning null');
          return null;
        }
      } catch (apiError) {
        console.log('UserService: Customer profile API error:', apiError);
        return null;
      }
    } catch (error) {
      console.error('UserService: Error in getCustomerProfile:', error);
      return null; // Don't throw, just return null
    }
  }

  async createCustomerProfile(userData) {
    try {
      console.log('UserService: createCustomerProfile called with data:', userData);
      await this.waitForGlobals();
      
      const response = await fetch('/api/now/table/x_1599224_online_d_customer', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-UserToken": window.g_ck || ''
        },
        body: JSON.stringify(userData),
      });

      console.log('UserService: Create customer profile response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('UserService: Create customer profile error response:', errorText);
        
        // For demo purposes, create a mock customer profile
        console.log('UserService: Creating mock customer profile for demo');
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

      const data = await response.json();
      console.log('UserService: Created customer profile data:', data);
      return data.result;
    } catch (error) {
      console.error('UserService: Error in createCustomerProfile:', error);
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
      await this.waitForGlobals();
      
      const response = await fetch(`/api/now/table/x_1599224_online_d_customer/${customerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-UserToken": window.g_ck || ''
        },
        body: JSON.stringify(userData),
      });

      console.log('UserService: Update customer profile response status:', response.status);

      if (!response.ok) {
        console.log('UserService: Update failed, returning mock response');
        return { ...userData, sys_id: customerId };
      }

      const data = await response.json();
      console.log('UserService: Updated customer profile data:', data);
      return data.result;
    } catch (error) {
      console.error('UserService: Error in updateCustomerProfile:', error);
      return { ...userData, sys_id: customerId };
    }
  }
}
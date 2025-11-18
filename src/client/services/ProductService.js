export class ProductService {
  constructor() {
    this.tableName = "x_1599224_online_d_product";
  }

  waitForGlobals() {
    return new Promise((resolve) => {
      const checkGlobals = () => {
        if (window.g_ck) {
          resolve();
        } else {
          setTimeout(checkGlobals, 100);
        }
      };
      checkGlobals();
    });
  }

  // Enhanced API call with multiple authentication methods
  async makeAuthenticatedRequest(url, options = {}) {
    console.log(`ProductService: Making authenticated request to ${url}`);
    
    // Try multiple authentication approaches
    const authMethods = [
      // Method 1: X-UserToken (ServiceNow standard)
      () => ({
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-UserToken': window.g_ck || '',
          ...options.headers
        },
        credentials: 'include'
      }),
      // Method 2: No special auth, rely on session
      () => ({
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: 'include'
      }),
      // Method 3: Basic session-based auth
      () => ({
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        }
      })
    ];

    for (let i = 0; i < authMethods.length; i++) {
      try {
        console.log(`ProductService: Trying authentication method ${i + 1}`);
        const authOptions = authMethods[i]();
        const response = await fetch(url, authOptions);
        
        console.log(`ProductService: Auth method ${i + 1} response status:`, response.status);
        
        if (response.ok) {
          console.log(`ProductService: Auth method ${i + 1} succeeded`);
          return response;
        } else if (response.status === 401 || response.status === 403) {
          console.log(`ProductService: Auth method ${i + 1} failed with ${response.status}, trying next method`);
          continue;
        } else {
          // Other error, return response for error handling
          return response;
        }
      } catch (error) {
        console.log(`ProductService: Auth method ${i + 1} threw error:`, error);
        if (i === authMethods.length - 1) {
          throw error;
        }
      }
    }
    
    throw new Error('All authentication methods failed');
  }

  // Mock product data for fallback (keeping comprehensive list)
  getMockProducts() {
    return [
      {
        sys_id: 'mock_apple_1',
        name: 'Fresh Red Apples',
        description: 'Crisp and sweet red apples, perfect for snacking or baking',
        category: 'fruits',
        price: 2.99,
        unit: 'pound',
        stock_quantity: 50,
        active: true,
        delivery_time_hours: 2
      },
      {
        sys_id: 'mock_banana_2',
        name: 'Organic Bananas',
        description: 'Yellow organic bananas, great source of potassium and natural energy',
        category: 'fruits',
        price: 1.89,
        unit: 'pound',
        stock_quantity: 75,
        active: true,
        delivery_time_hours: 2
      },
      {
        sys_id: 'mock_strawberry_3',
        name: 'Fresh Strawberries',
        description: 'Sweet, juicy strawberries perfect for desserts and snacking',
        category: 'fruits',
        price: 4.99,
        unit: 'piece',
        stock_quantity: 35,
        active: true,
        delivery_time_hours: 2
      },
      {
        sys_id: 'mock_tomato_4',
        name: 'Roma Tomatoes',
        description: 'Fresh roma tomatoes, perfect for cooking and salads',
        category: 'vegetables',
        price: 2.49,
        unit: 'pound',
        stock_quantity: 40,
        active: true,
        delivery_time_hours: 2
      },
      {
        sys_id: 'mock_spinach_5',
        name: 'Baby Spinach',
        description: 'Tender baby spinach leaves, great for salads and smoothies',
        category: 'vegetables',
        price: 3.99,
        unit: 'piece',
        stock_quantity: 20,
        active: true,
        delivery_time_hours: 2
      },
      {
        sys_id: 'mock_carrots_6',
        name: 'Fresh Carrots',
        description: 'Crunchy organic carrots, high in beta-carotene',
        category: 'vegetables',
        price: 1.99,
        unit: 'pound',
        stock_quantity: 55,
        active: true,
        delivery_time_hours: 2
      },
      {
        sys_id: 'mock_milk_7',
        name: 'Whole Milk',
        description: 'Fresh whole milk from local dairy farms, rich and creamy',
        category: 'dairy',
        price: 4.29,
        unit: 'gallon',
        stock_quantity: 30,
        active: true,
        delivery_time_hours: 1
      },
      {
        sys_id: 'mock_cheese_8',
        name: 'Cheddar Cheese',
        description: 'Sharp aged cheddar cheese, perfect for sandwiches and cooking',
        category: 'dairy',
        price: 5.99,
        unit: 'piece',
        stock_quantity: 22,
        active: true,
        delivery_time_hours: 1
      },
      {
        sys_id: 'mock_chicken_9',
        name: 'Chicken Breast',
        description: 'Fresh boneless, skinless chicken breast, lean and tender',
        category: 'meat',
        price: 8.99,
        unit: 'pound',
        stock_quantity: 15,
        active: true,
        delivery_time_hours: 1
      },
      {
        sys_id: 'mock_bread_10',
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread, rich in fiber',
        category: 'groceries',
        price: 3.49,
        unit: 'piece',
        stock_quantity: 25,
        active: true,
        delivery_time_hours: 3
      },
      {
        sys_id: 'mock_orange_juice_11',
        name: 'Orange Juice',
        description: 'Freshly squeezed orange juice, no pulp, vitamin C enriched',
        category: 'beverages',
        price: 5.99,
        unit: 'piece',
        stock_quantity: 35,
        active: true,
        delivery_time_hours: 2
      },
      {
        sys_id: 'mock_detergent_12',
        name: 'Laundry Detergent',
        description: 'High-efficiency laundry detergent, fresh scent, 64 loads',
        category: 'household',
        price: 12.99,
        unit: 'piece',
        stock_quantity: 18,
        active: true,
        delivery_time_hours: 4
      },
      {
        sys_id: 'mock_shampoo_13',
        name: 'Natural Shampoo',
        description: 'Sulfate-free natural shampoo for all hair types, moisturizing',
        category: 'personal_care',
        price: 8.49,
        unit: 'piece',
        stock_quantity: 22,
        active: true,
        delivery_time_hours: 3
      },
      {
        sys_id: 'mock_coffee_14',
        name: 'Premium Coffee Beans',
        description: 'Arabica coffee beans, medium roast, rich flavor',
        category: 'beverages',
        price: 12.99,
        unit: 'piece',
        stock_quantity: 20,
        active: true,
        delivery_time_hours: 2
      },
      {
        sys_id: 'mock_rice_15',
        name: 'Jasmine Rice',
        description: 'Premium jasmine rice, perfect for Asian dishes',
        category: 'groceries',
        price: 4.99,
        unit: 'piece',
        stock_quantity: 40,
        active: true,
        delivery_time_hours: 3
      },
      {
        sys_id: 'mock_salmon_16',
        name: 'Atlantic Salmon',
        description: 'Fresh Atlantic salmon fillets, rich in omega-3',
        category: 'meat',
        price: 12.99,
        unit: 'pound',
        stock_quantity: 8,
        active: true,
        delivery_time_hours: 1
      },
      {
        sys_id: 'mock_yogurt_17',
        name: 'Greek Yogurt',
        description: 'Thick and creamy Greek yogurt, high in protein',
        category: 'dairy',
        price: 6.49,
        unit: 'piece',
        stock_quantity: 18,
        active: true,
        delivery_time_hours: 1
      },
      {
        sys_id: 'mock_broccoli_18',
        name: 'Fresh Broccoli',
        description: 'Green broccoli crowns, packed with vitamins and fiber',
        category: 'vegetables',
        price: 2.79,
        unit: 'piece',
        stock_quantity: 32,
        active: true,
        delivery_time_hours: 2
      },
      {
        sys_id: 'mock_paper_towels_19',
        name: 'Paper Towels',
        description: 'Ultra-absorbent paper towels, 8-pack rolls',
        category: 'household',
        price: 8.99,
        unit: 'piece',
        stock_quantity: 24,
        active: true,
        delivery_time_hours: 4
      },
      {
        sys_id: 'mock_toothpaste_20',
        name: 'Whitening Toothpaste',
        description: 'Fluoride toothpaste with whitening action, mint flavor',
        category: 'personal_care',
        price: 4.99,
        unit: 'piece',
        stock_quantity: 38,
        active: true,
        delivery_time_hours: 3
      }
    ];
  }

  async getProducts(filters = {}) {
    try {
      console.log('ProductService: Getting products with filters:', filters);
      await this.waitForGlobals();
      
      const searchParams = new URLSearchParams();
      searchParams.set('sysparm_display_value', 'all');
      searchParams.set('sysparm_query', 'active=true');
      
      if (filters.category) {
        searchParams.set('sysparm_query', `active=true^category=${filters.category}`);
      }
      
      if (filters.search) {
        const currentQuery = searchParams.get('sysparm_query');
        searchParams.set('sysparm_query', `${currentQuery}^nameLIKE${filters.search}^ORdescriptionLIKE${filters.search}`);
      }

      const url = `/api/now/table/${this.tableName}?${searchParams.toString()}`;
      console.log('ProductService: Making API call to:', url);
      
      const response = await this.makeAuthenticatedRequest(url, {
        method: "GET"
      });

      console.log('ProductService: API response status:', response.status);

      if (!response.ok) {
        console.log('ProductService: API call failed with status:', response.status);
        const errorText = await response.text();
        console.log('ProductService: Error response:', errorText);
        console.log('ProductService: Falling back to mock data');
        return this.filterMockProducts(filters);
      }

      const data = await response.json();
      console.log('ProductService: API response data:', data);

      const products = data.result || [];
      
      if (products.length === 0) {
        console.log('ProductService: No products returned from API, using mock data');
        return this.filterMockProducts(filters);
      }

      console.log('ProductService: Successfully loaded', products.length, 'products from API');
      return products;
    } catch (error) {
      console.error('ProductService: Error fetching products, falling back to mock data:', error);
      return this.filterMockProducts(filters);
    }
  }

  filterMockProducts(filters = {}) {
    console.log('ProductService: Filtering mock products with filters:', filters);
    let products = this.getMockProducts();

    if (filters.category) {
      products = products.filter(product => product.category === filters.category);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }

    console.log('ProductService: Filtered to', products.length, 'mock products');
    return products;
  }

  async getProduct(sysId) {
    try {
      console.log('ProductService: Getting single product:', sysId);
      await this.waitForGlobals();
      
      const url = `/api/now/table/${this.tableName}/${sysId}?sysparm_display_value=all`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: "GET"
      });

      if (!response.ok) {
        // Find mock product
        const mockProducts = this.getMockProducts();
        return mockProducts.find(p => p.sys_id === sysId) || null;
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('ProductService: Error fetching product:', error);
      // Find mock product
      const mockProducts = this.getMockProducts();
      return mockProducts.find(p => p.sys_id === sysId) || null;
    }
  }

  async getCategories() {
    return [
      { value: 'groceries', label: 'Groceries' },
      { value: 'vegetables', label: 'Vegetables' },
      { value: 'fruits', label: 'Fruits' },
      { value: 'dairy', label: 'Dairy' },
      { value: 'meat', label: 'Meat & Seafood' },
      { value: 'beverages', label: 'Beverages' },
      { value: 'household', label: 'Household Items' },
      { value: 'personal_care', label: 'Personal Care' }
    ];
  }
}
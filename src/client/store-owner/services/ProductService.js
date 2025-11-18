export class ProductService {
  constructor() {
    this.tableName = "x_1599224_online_d_product";
  }

  // Wait for ServiceNow globals
  async waitForGlobals() {
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

  // Enhanced API call with authentication
  async makeAuthenticatedRequest(url, options = {}) {
    await this.waitForGlobals();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-UserToken': window.g_ck || '',
        ...options.headers
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response;
  }

  // Get all products
  async getProducts(filters = {}) {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('sysparm_display_value', 'all');
      searchParams.set('sysparm_limit', '1000');
      
      let query = '';
      
      // Add filters
      if (filters.category) {
        query += `category=${filters.category}`;
      }
      
      if (filters.search) {
        const searchFilter = `nameLIKE${filters.search}^ORdescriptionLIKE${filters.search}`;
        query = query ? `${query}^${searchFilter}` : searchFilter;
      }

      // Order by name
      query = query ? `${query}^ORDERBYname` : 'ORDERBYname';
      
      if (query) {
        searchParams.set('sysparm_query', query);
      }

      const url = `/api/now/table/${this.tableName}?${searchParams.toString()}`;
      console.log('ProductService: Fetching products from:', url);
      
      const response = await this.makeAuthenticatedRequest(url);
      const data = await response.json();
      
      console.log('ProductService: Products response:', data);
      return data.result || [];
    } catch (error) {
      console.error('ProductService: Error fetching products, using mock data:', error);
      return this.getMockProducts();
    }
  }

  // Get single product by ID
  async getProduct(productId) {
    try {
      const url = `/api/now/table/${this.tableName}/${productId}?sysparm_display_value=all`;
      const response = await this.makeAuthenticatedRequest(url);
      const data = await response.json();
      
      return data.result;
    } catch (error) {
      console.error('ProductService: Error fetching product:', error);
      const mockProducts = this.getMockProducts();
      return mockProducts.find(p => p.sys_id === productId) || null;
    }
  }

  // Create new product
  async createProduct(productData) {
    try {
      console.log('ProductService: Creating product with data:', productData);
      
      const url = `/api/now/table/${this.tableName}`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      
      const data = await response.json();
      console.log('ProductService: Created product:', data);
      return data.result;
    } catch (error) {
      console.error('ProductService: Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  // Update existing product
  async updateProduct(productId, productData) {
    try {
      console.log('ProductService: Updating product:', productId, productData);
      
      const url = `/api/now/table/${this.tableName}/${productId}`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'PATCH',
        body: JSON.stringify(productData)
      });
      
      const data = await response.json();
      console.log('ProductService: Updated product:', data);
      return data.result;
    } catch (error) {
      console.error('ProductService: Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  // Delete product
  async deleteProduct(productId) {
    try {
      console.log('ProductService: Deleting product:', productId);
      
      const url = `/api/now/table/${this.tableName}/${productId}`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'DELETE'
      });
      
      console.log('ProductService: Product deleted successfully');
      return true;
    } catch (error) {
      console.error('ProductService: Error deleting product:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  // Get product categories
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

  // Bulk update stock quantities
  async updateStock(updates) {
    try {
      const promises = updates.map(update => 
        this.updateProduct(update.productId, { stock_quantity: update.newQuantity })
      );
      
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('ProductService: Error updating stock:', error);
      throw error;
    }
  }

  // Get low stock products
  async getLowStockProducts(threshold = 10) {
    try {
      const products = await this.getProducts();
      return products.filter(product => {
        const stock = typeof product.stock_quantity === 'object' 
          ? parseInt(product.stock_quantity.display_value || 0)
          : parseInt(product.stock_quantity || 0);
        return stock < threshold;
      });
    } catch (error) {
      console.error('ProductService: Error getting low stock products:', error);
      return [];
    }
  }

  // Get product statistics
  async getProductStats() {
    try {
      const products = await this.getProducts();
      
      const stats = {
        total: products.length,
        active: 0,
        inactive: 0,
        lowStock: 0,
        outOfStock: 0,
        categories: {},
        averagePrice: 0,
        totalValue: 0
      };

      let totalPrice = 0;
      let activeProducts = 0;

      products.forEach(product => {
        const active = String(typeof product.active === 'object' 
          ? product.active.display_value 
          : product.active) === 'true';
        const stock = typeof product.stock_quantity === 'object' 
          ? parseInt(product.stock_quantity.display_value || 0)
          : parseInt(product.stock_quantity || 0);
        const price = typeof product.price === 'object' 
          ? parseFloat(product.price.display_value || 0)
          : parseFloat(product.price || 0);
        const category = typeof product.category === 'object' 
          ? product.category.display_value 
          : product.category;

        // Count active/inactive
        if (active) {
          stats.active++;
          activeProducts++;
          totalPrice += price;
        } else {
          stats.inactive++;
        }

        // Count stock levels
        if (stock === 0) {
          stats.outOfStock++;
        } else if (stock < 10) {
          stats.lowStock++;
        }

        // Count by category
        if (category) {
          stats.categories[category] = (stats.categories[category] || 0) + 1;
        }

        // Calculate inventory value
        stats.totalValue += price * stock;
      });

      stats.averagePrice = activeProducts > 0 ? totalPrice / activeProducts : 0;

      return stats;
    } catch (error) {
      console.error('ProductService: Error getting product stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        lowStock: 0,
        outOfStock: 0,
        categories: {},
        averagePrice: 0,
        totalValue: 0
      };
    }
  }

  // Mock product data for fallback
  getMockProducts() {
    return [
      {
        sys_id: 'mock_apple_1',
        name: { display_value: 'Fresh Red Apples' },
        description: { display_value: 'Crisp and sweet red apples, perfect for snacking or baking' },
        category: { display_value: 'fruits', value: 'fruits' },
        price: { display_value: '2.99' },
        unit: { display_value: 'pound' },
        stock_quantity: { display_value: '50' },
        active: { display_value: 'true' }
      },
      {
        sys_id: 'mock_banana_2',
        name: { display_value: 'Organic Bananas' },
        description: { display_value: 'Yellow organic bananas, great source of potassium' },
        category: { display_value: 'fruits', value: 'fruits' },
        price: { display_value: '1.89' },
        unit: { display_value: 'pound' },
        stock_quantity: { display_value: '75' },
        active: { display_value: 'true' }
      },
      {
        sys_id: 'mock_milk_7',
        name: { display_value: 'Whole Milk' },
        description: { display_value: 'Fresh whole milk from local dairy farms' },
        category: { display_value: 'dairy', value: 'dairy' },
        price: { display_value: '4.29' },
        unit: { display_value: 'gallon' },
        stock_quantity: { display_value: '30' },
        active: { display_value: 'true' }
      },
      {
        sys_id: 'mock_bread_10',
        name: { display_value: 'Whole Wheat Bread' },
        description: { display_value: 'Freshly baked whole wheat bread' },
        category: { display_value: 'groceries', value: 'groceries' },
        price: { display_value: '3.49' },
        unit: { display_value: 'piece' },
        stock_quantity: { display_value: '8' },
        active: { display_value: 'true' }
      },
      {
        sys_id: 'mock_detergent_12',
        name: { display_value: 'Laundry Detergent' },
        description: { display_value: 'High-efficiency laundry detergent' },
        category: { display_value: 'household', value: 'household' },
        price: { display_value: '12.99' },
        unit: { display_value: 'piece' },
        stock_quantity: { display_value: '2' },
        active: { display_value: 'true' }
      }
    ];
  }
}
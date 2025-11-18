export class CartService {
  constructor() {
    this.storageKey = 'delivery_app_cart';
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

  // Local storage fallback for cart persistence
  saveCartToLocalStorage(cart) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cart));
      return true;
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      return false;
    }
  }

  loadCartFromLocalStorage() {
    try {
      const cartData = localStorage.getItem(this.storageKey);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  }

  clearCartFromLocalStorage() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
      return false;
    }
  }

  // Server-side cart persistence (requires authentication)
  async saveCartToServer(customerId, cart) {
    try {
      await this.waitForGlobals();
      
      const ga = new GlideAjax('CartManagerAPI');
      ga.addParam('sysparm_name', 'saveCart');
      ga.addParam('sysparm_customer_id', customerId);
      ga.addParam('sysparm_cart_data', JSON.stringify(cart));
      
      return new Promise((resolve, reject) => {
        ga.getXML((response) => {
          try {
            const result = JSON.parse(response.responseText);
            if (result.success) {
              resolve(result);
            } else {
              reject(new Error(result.error || 'Failed to save cart'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error saving cart to server:', error);
      throw error;
    }
  }

  async loadCartFromServer(customerId) {
    try {
      await this.waitForGlobals();
      
      const ga = new GlideAjax('CartManagerAPI');
      ga.addParam('sysparm_name', 'loadCart');
      ga.addParam('sysparm_customer_id', customerId);
      
      return new Promise((resolve, reject) => {
        ga.getXML((response) => {
          try {
            const result = JSON.parse(response.responseText);
            if (result.success) {
              resolve(result.cart || []);
            } else {
              reject(new Error(result.error || 'Failed to load cart'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error loading cart from server:', error);
      // Fall back to local storage
      return this.loadCartFromLocalStorage();
    }
  }

  async clearCartFromServer(customerId) {
    try {
      await this.waitForGlobals();
      
      const ga = new GlideAjax('CartManagerAPI');
      ga.addParam('sysparm_name', 'clearCart');
      ga.addParam('sysparm_customer_id', customerId);
      
      return new Promise((resolve, reject) => {
        ga.getXML((response) => {
          try {
            const result = JSON.parse(response.responseText);
            if (result.success) {
              resolve(result);
            } else {
              reject(new Error(result.error || 'Failed to clear cart'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error clearing cart from server:', error);
      throw error;
    }
  }

  async getOrderItemsForReorder(orderId) {
    try {
      await this.waitForGlobals();
      
      const ga = new GlideAjax('CartManagerAPI');
      ga.addParam('sysparm_name', 'getOrderItemsForReorder');
      ga.addParam('sysparm_order_id', orderId);
      
      return new Promise((resolve, reject) => {
        ga.getXML((response) => {
          try {
            const result = JSON.parse(response.responseText);
            if (result.success) {
              resolve(result.items || []);
            } else {
              reject(new Error(result.error || 'Failed to get order items'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error getting order items for reorder:', error);
      throw error;
    }
  }

  // Unified cart persistence (tries server first, falls back to local storage)
  async saveCart(cart, customerId = null) {
    // Always save to local storage as backup
    this.saveCartToLocalStorage(cart);
    
    if (customerId) {
      try {
        await this.saveCartToServer(customerId, cart);
        return { success: true, method: 'server' };
      } catch (error) {
        console.warn('Server cart save failed, using local storage:', error);
        return { success: true, method: 'localStorage' };
      }
    } else {
      return { success: true, method: 'localStorage' };
    }
  }

  async loadCart(customerId = null) {
    if (customerId) {
      try {
        const serverCart = await this.loadCartFromServer(customerId);
        // If server cart is available, also update local storage
        if (serverCart.length > 0) {
          this.saveCartToLocalStorage(serverCart);
          return { cart: serverCart, source: 'server' };
        }
      } catch (error) {
        console.warn('Server cart load failed, trying local storage:', error);
      }
    }
    
    // Fall back to local storage
    const localCart = this.loadCartFromLocalStorage();
    return { cart: localCart, source: 'localStorage' };
  }

  async clearCart(customerId = null) {
    // Clear local storage
    this.clearCartFromLocalStorage();
    
    if (customerId) {
      try {
        await this.clearCartFromServer(customerId);
        return { success: true, method: 'server' };
      } catch (error) {
        console.warn('Server cart clear failed:', error);
        return { success: true, method: 'localStorage' };
      }
    } else {
      return { success: true, method: 'localStorage' };
    }
  }

  // Cart manipulation utilities
  addItemToCart(cart, product, quantity = 1) {
    const productId = typeof product.sys_id === 'object' ? product.sys_id.value : product.sys_id;
    const existing = cart.find(item => {
      const itemId = typeof item.product.sys_id === 'object' ? item.product.sys_id.value : item.product.sys_id;
      return itemId === productId;
    });

    if (existing) {
      return cart.map(item => {
        const itemId = typeof item.product.sys_id === 'object' ? item.product.sys_id.value : item.product.sys_id;
        return itemId === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item;
      });
    }

    return [...cart, { product, quantity }];
  }

  updateCartItemQuantity(cart, productId, newQuantity) {
    if (newQuantity <= 0) {
      return cart.filter(item => {
        const itemId = typeof item.product.sys_id === 'object' ? item.product.sys_id.value : item.product.sys_id;
        return itemId !== productId;
      });
    }

    return cart.map(item => {
      const itemId = typeof item.product.sys_id === 'object' ? item.product.sys_id.value : item.product.sys_id;
      return itemId === productId
        ? { ...item, quantity: newQuantity }
        : item;
    });
  }

  calculateCartTotal(cart) {
    return cart.reduce((sum, item) => {
      const price = typeof item.product.price === 'object' 
        ? parseFloat(item.product.price.display_value || 0)
        : parseFloat(item.product.price || 0);
      return sum + (price * item.quantity);
    }, 0);
  }

  getCartItemCount(cart) {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  formatPrice(price) {
    const numPrice = parseFloat(price || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numPrice);
  }
}
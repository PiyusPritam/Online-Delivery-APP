import React, { useState, useEffect } from 'react';
import { ProductService } from '../services/ProductService.js';

export default function ProductGrid({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [debugInfo, setDebugInfo] = useState([]);
  const [usingMockData, setUsingMockData] = useState(false);
  const [currentView, setCurrentView] = useState('categories'); // 'categories' or 'products'

  const productService = new ProductService();

  const addDebugInfo = (message) => {
    console.log('PRODUCTS DEBUG:', message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addDebugInfo('ProductGrid component mounted');
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      addDebugInfo('Loading categories...');
      const categoryList = await productService.getCategories();
      setCategories(categoryList);
      addDebugInfo(`Loaded ${categoryList.length} categories`);
    } catch (err) {
      addDebugInfo(`Error loading categories: ${err.message}`);
      console.error('Error loading categories:', err);
    }
  };

  const loadProducts = async (categoryFilter = null, search = '') => {
    try {
      setLoading(true);
      setError('');
      addDebugInfo(`Starting to load products for category: ${categoryFilter || 'all'}`);
      
      const filters = {};
      if (categoryFilter) filters.category = categoryFilter;
      if (search) filters.search = search;
      
      addDebugInfo(`Loading products with filters: ${JSON.stringify(filters)}`);
      
      const productList = await productService.getProducts(filters);
      
      addDebugInfo(`Received ${productList.length} products`);
      
      // Enhanced sys_id checking for mock data detection
      if (productList.length > 0 && productList[0].sys_id) {
        const firstProduct = productList[0];
        const sysIdType = typeof firstProduct.sys_id;
        addDebugInfo(`First product sys_id type: ${sysIdType}`);
        
        let sysIdValue;
        if (sysIdType === 'object') {
          sysIdValue = firstProduct.sys_id.value || firstProduct.sys_id.display_value;
          addDebugInfo(`First product sys_id value: ${JSON.stringify(firstProduct.sys_id)}`);
        } else {
          sysIdValue = firstProduct.sys_id;
        }
        
        addDebugInfo(`Extracted sys_id value: ${sysIdValue}`);
        
        if (sysIdValue && typeof sysIdValue === 'string' && sysIdValue.startsWith('mock_')) {
          setUsingMockData(true);
          addDebugInfo('Using mock data (API not available)');
        } else {
          setUsingMockData(false);
          addDebugInfo('Using real API data');
        }
      }
      
      setProducts(productList);
      addDebugInfo('Products loaded successfully');
    } catch (err) {
      const errorMessage = `Failed to load products: ${err.message}`;
      addDebugInfo(errorMessage);
      setError(errorMessage);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentView('products');
    loadProducts(category.value);
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setProducts([]);
    setSearchTerm('');
  };

  const handleSearch = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
    if (selectedCategory) {
      loadProducts(selectedCategory.value, search);
    }
  };

  const handleAddToCart = (product) => {
    const productName = typeof product.name === 'object' ? product.name.display_value : product.name;
    addDebugInfo(`Adding product to cart: ${productName}`);
    onAddToCart(product, 1);
    
    // Show brief feedback
    const productId = typeof product.sys_id === 'object' ? product.sys_id.value : product.sys_id;
    const button = document.querySelector(`[data-product="${productId}"]`);
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Added!';
      button.style.backgroundColor = '#28a745';
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 1500);
    }
  };

  const getCategoryInfo = (categoryValue) => {
    const categoryMap = {
      groceries: { emoji: '🛒', title: 'Groceries', description: 'Essential daily items', color: '#FF6B6B' },
      vegetables: { emoji: '🥬', title: 'Vegetables', description: 'Fresh & organic veggies', color: '#4ECDC4' },
      fruits: { emoji: '🍎', title: 'Fruits', description: 'Sweet & juicy fruits', color: '#45B7D1' },
      dairy: { emoji: '🥛', title: 'Dairy', description: 'Milk, cheese & more', color: '#F7DC6F' },
      meat: { emoji: '🥩', title: 'Meat & Seafood', description: 'Fresh protein sources', color: '#BB8FCE' },
      beverages: { emoji: '🥤', title: 'Beverages', description: 'Drinks & refreshments', color: '#85C1E9' },
      household: { emoji: '🏠', title: 'Household', description: 'Cleaning & home items', color: '#F8C471' },
      personal_care: { emoji: '🧴', title: 'Personal Care', description: 'Health & beauty products', color: '#82E0AA' }
    };
    return categoryMap[categoryValue] || { emoji: '📦', title: categoryValue, description: 'Products', color: '#BDC3C7' };
  };

  const getProductIcon = (product) => {
    const name = (typeof product.name === 'object' ? product.name.display_value : product.name || '').toLowerCase();
    const category = (typeof product.category === 'object' ? product.category.display_value : product.category || '').toLowerCase();

    // Specific product icons
    const productIconMap = {
      'apple': '🍎', 'apples': '🍎', 'banana': '🍌', 'bananas': '🍌', 'orange': '🍊', 'oranges': '🍊',
      'strawberry': '🍓', 'strawberries': '🍓', 'grapes': '🍇', 'grape': '🍇', 'watermelon': '🍉',
      'lemon': '🍋', 'lemons': '🍋', 'pineapple': '🍍', 'peach': '🍑', 'peaches': '🍑',
      'tomato': '🍅', 'tomatoes': '🍅', 'carrot': '🥕', 'carrots': '🥕', 'broccoli': '🥦',
      'lettuce': '🥬', 'spinach': '🥬', 'potato': '🥔', 'potatoes': '🥔', 'onion': '🧅', 'onions': '🧅',
      'garlic': '🧄', 'corn': '🌽', 'pepper': '🌶️', 'peppers': '🌶️', 'cucumber': '🥒',
      'milk': '🥛', 'cheese': '🧀', 'butter': '🧈', 'yogurt': '🍶', 'cream': '🥛',
      'chicken': '🐔', 'beef': '🥩', 'pork': '🥓', 'fish': '🐟', 'salmon': '🐟', 'shrimp': '🦐',
      'bread': '🍞', 'rice': '🍚', 'pasta': '🍝', 'cereal': '🥣', 'oats': '🌾',
      'coffee': '☕', 'tea': '🍵', 'juice': '🧃', 'water': '💧', 'soda': '🥤', 'beer': '🍺', 'wine': '🍷',
      'soap': '🧼', 'shampoo': '🧴', 'toothpaste': '🦷', 'detergent': '🧽', 'tissue': '🧻',
      'oil': '🫗', 'salt': '🧂', 'sugar': '🍯', 'flour': '🌾', 'egg': '🥚', 'eggs': '🥚'
    };

    // Check for specific product matches first
    for (const [key, icon] of Object.entries(productIconMap)) {
      if (name.includes(key)) {
        return icon;
      }
    }

    // Fallback to category icons
    const categoryIcons = {
      'groceries': '🛒', 'vegetables': '🥬', 'fruits': '🍎', 'dairy': '🥛',
      'meat': '🥩', 'beverages': '🥤', 'household': '🏠', 'personal_care': '🧴'
    };
    
    return categoryIcons[category] || '📦';
  };

  // Categories view
  if (currentView === 'categories') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '50px',
          color: 'white'
        }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '700', 
            margin: '0 0 15px 0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🚚 Quick Delivery
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            opacity: '0.9',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Shop from our wide range of categories and get everything delivered to your doorstep
          </p>
        </div>

        {/* Categories Grid */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {categories.map(category => {
            const categoryInfo = getCategoryInfo(category.value);
            return (
              <div
                key={category.value}
                onClick={() => handleCategorySelect(category)}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '40px 30px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  border: `4px solid ${categoryInfo.color}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-10px)';
                  e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                }}
              >
                {/* Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(45deg, ${categoryInfo.color}20, transparent)`,
                  borderRadius: '50%'
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    fontSize: '4rem', 
                    marginBottom: '20px',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
                  }}>
                    {categoryInfo.emoji}
                  </div>
                  <h3 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '1.5rem', 
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}>
                    {categoryInfo.title}
                  </h3>
                  <p style={{ 
                    margin: '0 0 20px 0', 
                    color: '#7f8c8d',
                    fontSize: '1rem',
                    lineHeight: '1.5'
                  }}>
                    {categoryInfo.description}
                  </p>
                  <div style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: categoryInfo.color,
                    color: 'white',
                    borderRadius: '25px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    Shop Now →
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '60px',
          color: 'white',
          opacity: '0.8'
        }}>
          <p>✨ Fresh products • 🚀 Fast delivery • 💯 Quality guaranteed</p>
        </div>
      </div>
    );
  }

  // Products view
  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f8f9fa',
      padding: '20px'
    }}>
      {/* Header with Back Button */}
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '30px'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <button
            onClick={handleBackToCategories}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 24px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#5a6268';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#6c757d';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ← Back to Categories
          </button>

          {selectedCategory && (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{ 
                fontSize: '2rem' 
              }}>
                {getCategoryInfo(selectedCategory.value).emoji}
              </div>
              <div>
                <h2 style={{ 
                  margin: '0',
                  fontSize: '2rem',
                  color: '#2c3e50'
                }}>
                  {getCategoryInfo(selectedCategory.value).title}
                </h2>
                <p style={{ 
                  margin: '0',
                  color: '#6c757d',
                  fontSize: '1rem'
                }}>
                  {getCategoryInfo(selectedCategory.value).description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ 
          maxWidth: '500px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder={`Search in ${selectedCategory?.label || 'products'}...`}
            value={searchTerm}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '15px 50px 15px 20px',
              border: '2px solid #e9ecef',
              borderRadius: '25px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#007bff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e9ecef';
            }}
          />
          <div style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.2rem',
            color: '#6c757d'
          }}>
            🔍
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {usingMockData && (
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto 20px',
          background: '#fff3cd', 
          color: '#856404', 
          padding: '15px 20px', 
          borderRadius: '10px', 
          border: '1px solid #ffeaa7',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🔧 <strong>Demo Mode:</strong> Using sample data - ServiceNow API not available
        </div>
      )}

      {error && (
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto 20px',
          background: '#ffebee', 
          color: '#c62828', 
          padding: '15px 20px', 
          borderRadius: '10px',
          border: '1px solid #ffcdd2'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ 
          textAlign: 'center',
          padding: '40px'
        }}>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '1.1rem', color: '#6c757d' }}>Loading products...</p>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 && !loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📦</div>
          <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No products found</h3>
          <p style={{ color: '#adb5bd' }}>Try adjusting your search or browse other categories</p>
        </div>
      ) : (
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '25px' 
        }}>
          {products.map(product => {
            const productId = typeof product.sys_id === 'object' ? product.sys_id.value : product.sys_id;
            const name = typeof product.name === 'object' ? product.name.display_value : product.name;
            const description = typeof product.description === 'object' ? product.description.display_value : product.description;
            const category = typeof product.category === 'object' ? product.category.display_value : product.category;
            const price = typeof product.price === 'object' ? product.price.display_value : product.price;
            const unit = typeof product.unit === 'object' ? product.unit.display_value : product.unit;
            const stockQuantity = typeof product.stock_quantity === 'object' ? product.stock_quantity.display_value : product.stock_quantity;

            return (
              <div key={productId} style={{
                background: 'white',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                border: '1px solid #e9ecef',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
              }}>
                
                {/* Stock indicator */}
                {parseInt(stockQuantity || 0) <= 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: '#dc3545',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Out of Stock
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ 
                    fontSize: '3rem', 
                    marginBottom: '15px',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
                  }}>
                    {getProductIcon(product)}
                  </div>
                </div>
                
                <div>
                  <h3 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '1.3rem', 
                    fontWeight: '600',
                    color: '#2c3e50',
                    lineHeight: '1.3'
                  }}>
                    {name}
                  </h3>
                  
                  {description && (
                    <p style={{ 
                      margin: '0 0 20px 0', 
                      fontSize: '14px', 
                      color: '#6c757d',
                      lineHeight: '1.5'
                    }}>
                      {description}
                    </p>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <span style={{ 
                      background: '#e3f2fd', 
                      color: '#1976d2',
                      padding: '6px 12px', 
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      per {unit}
                    </span>
                    
                    {parseInt(stockQuantity || 0) > 0 && parseInt(stockQuantity || 0) < 10 && (
                      <span style={{ 
                        background: '#fff3cd', 
                        color: '#856404',
                        padding: '6px 12px', 
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Only {stockQuantity} left!
                      </span>
                    )}
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      color: '#007bff' 
                    }}>
                      ${parseFloat(price || 0).toFixed(2)}
                    </div>
                    
                    {parseInt(stockQuantity || 0) > 0 ? (
                      <button
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '25px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        data-product={productId}
                        onClick={() => handleAddToCart(product)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#0056b3';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#007bff';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <button
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '25px',
                          cursor: 'not-allowed',
                          fontSize: '14px',
                          fontWeight: '600',
                          opacity: '0.6'
                        }}
                        disabled
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
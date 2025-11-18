import React, { useState, useEffect } from 'react';
import { ProductService } from '../services/ProductService.js';

export default function ProductGrid({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [debugInfo, setDebugInfo] = useState([]);
  const [usingMockData, setUsingMockData] = useState(false);

  const productService = new ProductService();

  const addDebugInfo = (message) => {
    console.log('PRODUCTS DEBUG:', message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addDebugInfo('ProductGrid component mounted');
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    addDebugInfo(`Filters changed - Category: ${selectedCategory}, Search: ${searchTerm}`);
    loadProducts();
  }, [selectedCategory, searchTerm]);

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

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      addDebugInfo('Starting to load products...');
      
      const filters = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (searchTerm) filters.search = searchTerm;
      
      addDebugInfo(`Loading products with filters: ${JSON.stringify(filters)}`);
      
      const productList = await productService.getProducts(filters);
      
      addDebugInfo(`Received ${productList.length} products`);
      
      // Check if we're using mock data
      if (productList.length > 0 && productList[0].sys_id && productList[0].sys_id.startsWith('mock_')) {
        setUsingMockData(true);
        addDebugInfo('Using mock data (API not available)');
      } else {
        setUsingMockData(false);
        addDebugInfo('Using real API data');
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

  const handleAddToCart = (product) => {
    addDebugInfo(`Adding product to cart: ${product.name}`);
    onAddToCart(product, 1);
    // Show brief feedback
    const button = document.querySelector(`[data-product="${typeof product.sys_id === 'object' ? product.sys_id.value : product.sys_id}"]`);
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Added!';
      button.style.backgroundColor = '#28a745';
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 1000);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div>Loading products...</div>
        <div style={{ 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          animation: 'spin 2s linear infinite',
          margin: '10px 0'
        }}></div>
        
        <details style={{ marginTop: '20px' }}>
          <summary>Loading Debug Info ({debugInfo.length} entries)</summary>
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
            {debugInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
        </details>

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
    <div className="product-grid-container">
      {usingMockData && (
        <div style={{ 
          background: '#fff3cd', 
          color: '#856404', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #ffeaa7'
        }}>
          🔧 <strong>Demo Mode:</strong> Using sample data - ServiceNow API not available
        </div>
      )}

      <div className="product-filters" style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div className="filter-group" style={{ flex: '1', minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Search products..."
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group" style={{ minWidth: '150px' }}>
          <select
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
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
          <details style={{ marginTop: '10px' }}>
            <summary>Debug Information</summary>
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
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          </details>
        </div>
      )}

      {products.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No products found. Try adjusting your search or category filter.</p>
          <details style={{ marginTop: '20px' }}>
            <summary>Debug Information</summary>
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
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          </details>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px' 
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
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease'
              }}>
                <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '48px', 
                    marginBottom: '10px' 
                  }}>
                    {getCategoryEmoji(category)}
                  </div>
                </div>
                
                <div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600' }}>
                    {name}
                  </h3>
                  {description && (
                    <p style={{ 
                      margin: '0 0 15px 0', 
                      fontSize: '14px', 
                      color: '#666',
                      lineHeight: '1.4'
                    }}>
                      {description}
                    </p>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '15px',
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    <span style={{ 
                      background: '#e3f2fd', 
                      padding: '4px 8px', 
                      borderRadius: '12px',
                      fontSize: '11px'
                    }}>
                      {category}
                    </span>
                    <span>{unit}</span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#007bff' }}>
                      ${parseFloat(price || 0).toFixed(2)}
                    </div>
                    
                    <div>
                      {parseInt(stockQuantity || 0) > 0 ? (
                        <button
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          data-product={productId}
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <span style={{ 
                          color: '#dc3545', 
                          fontSize: '14px', 
                          fontWeight: '500' 
                        }}>
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {parseInt(stockQuantity || 0) < 10 && parseInt(stockQuantity || 0) > 0 && (
                    <div style={{ 
                      background: '#fff3cd', 
                      color: '#856404', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      textAlign: 'center'
                    }}>
                      Only {stockQuantity} left!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading && products.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px'
        }}>
          Updating products...
        </div>
      )}
    </div>
  );
}

function getCategoryEmoji(category) {
  const emojiMap = {
    'groceries': '🛒',
    'vegetables': '🥬',
    'fruits': '🍎',
    'dairy': '🥛',
    'meat': '🥩',
    'beverages': '🥤',
    'household': '🏠',
    'personal_care': '🧴'
  };
  return emojiMap[category?.toLowerCase()] || '📦';
}
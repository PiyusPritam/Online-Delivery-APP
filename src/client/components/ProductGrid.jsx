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
  const [currentView, setCurrentView] = useState('categories');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  const productService = new ProductService();

  const addDebugInfo = (message) => {
    console.log('PRODUCTS DEBUG:', message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Format price in INR
  const formatPrice = (price) => {
    const numPrice = parseFloat(price || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numPrice);
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
    setSortBy('name');
    setShowFilters(false);
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
    
    // Show brief feedback with animation
    const productId = typeof product.sys_id === 'object' ? product.sys_id.value : product.sys_id;
    const button = document.querySelector(`[data-product="${productId}"]`);
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '✓ Added!';
      button.style.backgroundColor = '#10b981';
      button.style.transform = 'scale(1.05)';
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = '';
        button.style.transform = 'scale(1)';
      }, 1500);
    }
  };

  const getCategoryInfo = (categoryValue) => {
    const categoryMap = {
      groceries: { 
        emoji: '🛒', 
        title: 'Groceries & Staples', 
        description: 'Rice, dal, oil & daily essentials', 
        color: '#ef4444',
        gradient: 'from-red-500 to-pink-500'
      },
      vegetables: { 
        emoji: '🥬', 
        title: 'Fresh Vegetables', 
        description: 'Farm-fresh organic vegetables', 
        color: '#10b981',
        gradient: 'from-green-500 to-emerald-500'
      },
      fruits: { 
        emoji: '🥭', 
        title: 'Fresh Fruits', 
        description: 'Seasonal & exotic fruits', 
        color: '#f59e0b',
        gradient: 'from-yellow-500 to-orange-500'
      },
      dairy: { 
        emoji: '🥛', 
        title: 'Dairy Products', 
        description: 'Milk, paneer, curd & ghee', 
        color: '#3b82f6',
        gradient: 'from-blue-500 to-indigo-500'
      },
      meat: { 
        emoji: '🍖', 
        title: 'Meat & Seafood', 
        description: 'Fresh chicken, mutton & fish', 
        color: '#8b5cf6',
        gradient: 'from-purple-500 to-violet-500'
      },
      beverages: { 
        emoji: '☕', 
        title: 'Beverages', 
        description: 'Tea, coffee, juices & drinks', 
        color: '#06b6d4',
        gradient: 'from-cyan-500 to-blue-500'
      },
      household: { 
        emoji: '🧽', 
        title: 'Household Items', 
        description: 'Cleaning & home essentials', 
        color: '#84cc16',
        gradient: 'from-lime-500 to-green-500'
      },
      personal_care: { 
        emoji: '🧴', 
        title: 'Personal Care', 
        description: 'Health & beauty products', 
        color: '#ec4899',
        gradient: 'from-pink-500 to-rose-500'
      },
      spices: { 
        emoji: '🌶️', 
        title: 'Spices & Masalas', 
        description: 'Authentic Indian spices', 
        color: '#dc2626',
        gradient: 'from-red-600 to-orange-600'
      }
    };
    return categoryMap[categoryValue] || { 
      emoji: '📦', 
      title: categoryValue, 
      description: 'Products', 
      color: '#6b7280',
      gradient: 'from-gray-500 to-slate-500'
    };
  };

  const getProductIcon = (product) => {
    const name = (typeof product.name === 'object' ? product.name.display_value : product.name || '').toLowerCase();
    const category = (typeof product.category === 'object' ? product.category.display_value : product.category || '').toLowerCase();

    // Indian-specific product icons
    const productIconMap = {
      // Indian fruits
      'mango': '🥭', 'mangoes': '🥭', 'alphonso': '🥭',
      'banana': '🍌', 'bananas': '🍌', 'robusta': '🍌',
      'pomegranate': '🟣', 'pomegranates': '🟣', 'anar': '🟣',
      'orange': '🍊', 'oranges': '🍊', 'nagpur': '🍊',
      'grapes': '🍇', 'grape': '🍇', 'nashik': '🍇',
      
      // Indian vegetables
      'tomato': '🍅', 'tomatoes': '🍅', 'tamatar': '🍅',
      'onion': '🧅', 'onions': '🧅', 'pyaz': '🧅',
      'potato': '🥔', 'potatoes': '🥔', 'aloo': '🥔',
      'okra': '🫛', 'bhindi': '🫛', 'ladyfinger': '🫛',
      'spinach': '🥬', 'palak': '🥬',
      
      // Indian dairy
      'milk': '🥛', 'doodh': '🥛', 'amul': '🥛',
      'paneer': '🧀', 'cheese': '🧀',
      'curd': '🥛', 'dahi': '🥛', 'yogurt': '🥛',
      'ghee': '🧈', 'butter': '🧈',
      
      // Indian meat & seafood
      'chicken': '🐔', 'murgi': '🐔',
      'mutton': '🐑', 'lamb': '🐑', 'bakra': '🐑',
      'fish': '🐟', 'machli': '🐟', 'pomfret': '🐟',
      
      // Indian groceries
      'rice': '🍚', 'chawal': '🍚', 'basmati': '🍚',
      'atta': '🌾', 'wheat': '🌾', 'flour': '🌾',
      'dal': '🫘', 'toor': '🫘', 'moong': '🫘', 'chana': '🫘',
      'oil': '🫗', 'tel': '🫗', 'sunflower': '🫗',
      
      // Spices
      'turmeric': '🟡', 'haldi': '🟡',
      'chili': '🌶️', 'mirch': '🌶️', 'red': '🌶️',
      'masala': '🌶️', 'garam': '🌶️',
      
      // Beverages
      'tea': '🍵', 'chai': '🍵', 'tata': '🍵',
      'coffee': '☕', 'coconut': '🥥', 'nariyal': '🥥',
      'lassi': '🥛', 'mango': '🥭',
      'water': '💧', 'bisleri': '💧',
      
      // Household & Personal Care
      'soap': '🧼', 'sabun': '🧼', 'lifebuoy': '🧼',
      'shampoo': '🧴', 'pantene': '🧴',
      'toothpaste': '🦷', 'colgate': '🦷',
      'detergent': '🧽', 'ariel': '🧽', 'surf': '🧽',
      'vim': '🧽', 'dishwash': '🧽'
    };

    // Check for specific product matches first
    for (const [key, icon] of Object.entries(productIconMap)) {
      if (name.includes(key)) {
        return icon;
      }
    }

    // Fallback to category icons
    const categoryIcons = {
      'groceries': '🛒', 'vegetables': '🥬', 'fruits': '🥭', 'dairy': '🥛',
      'meat': '🍖', 'beverages': '☕', 'household': '🧽', 'personal_care': '🧴', 'spices': '🌶️'
    };
    
    return categoryIcons[category] || '📦';
  };

  const sortProducts = (productList) => {
    const sorted = [...productList].sort((a, b) => {
      const aValue = typeof a[sortBy] === 'object' ? a[sortBy].display_value : a[sortBy];
      const bValue = typeof b[sortBy] === 'object' ? b[sortBy].display_value : b[sortBy];
      
      if (sortBy === 'price') {
        return parseFloat(aValue || 0) - parseFloat(bValue || 0);
      }
      return (aValue || '').toString().localeCompare((bValue || '').toString());
    });
    return sorted;
  };

  const sortedProducts = sortProducts(products);

  // Categories view with modern design
  if (currentView === 'categories') {
    return (
      <div className="modern-categories-view">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">🚚</span>
              <span className="badge-text">Quick Delivery</span>
            </div>
            <h1 className="hero-title">
              Shop from India's Best
              <span className="gradient-text"> Grocery Store</span>
            </h1>
            <p className="hero-subtitle">
              Fresh products delivered to your doorstep in 30 minutes or less
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Products</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">30min</div>
                <div className="stat-label">Delivery</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Available</div>
              </div>
            </div>
          </div>
          <div className="hero-decoration">
            <div className="floating-element element-1">🥭</div>
            <div className="floating-element element-2">🥬</div>
            <div className="floating-element element-3">🥛</div>
            <div className="floating-element element-4">🌶️</div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="categories-section">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Choose from our wide range of fresh and quality products</p>
          </div>
          
          <div className="categories-grid">
            {categories.map(category => {
              const categoryInfo = getCategoryInfo(category.value);
              return (
                <div
                  key={category.value}
                  className="category-card"
                  onClick={() => handleCategorySelect(category)}
                  style={{ '--category-color': categoryInfo.color }}
                >
                  <div className="category-background"></div>
                  <div className="category-content">
                    <div className="category-icon">
                      {categoryInfo.emoji}
                      <div className="icon-glow"></div>
                    </div>
                    <h3 className="category-title">{categoryInfo.title}</h3>
                    <p className="category-description">{categoryInfo.description}</p>
                    <div className="category-action">
                      <span className="action-text">Shop Now</span>
                      <svg className="action-arrow" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-text">30-minute delivery guarantee</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3 className="feature-title">Fresh & Organic</h3>
              <p className="feature-text">Directly from farmers</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3 className="feature-title">Best Prices</h3>
              <p className="feature-text">Competitive INR pricing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Quality Assured</h3>
              <p className="feature-text">100% satisfaction guarantee</p>
            </div>
          </div>
        </div>

        <style jsx>{`
          .modern-categories-view {
            min-height: 100vh;
            background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
          }

          .hero-section {
            position: relative;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 80px 20px;
            overflow: hidden;
          }

          .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="30" r="1.5" fill="rgba(255,255,255,0.05)"/><circle cx="40" cy="70" r="0.8" fill="rgba(255,255,255,0.08)"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grain)"/></svg>');
          }

          .hero-content {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
            position: relative;
            z-index: 2;
          }

          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            padding: 8px 16px;
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            margin-bottom: 24px;
            color: white;
            font-weight: 600;
            font-size: 14px;
          }

          .badge-icon {
            font-size: 18px;
          }

          .hero-title {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 800;
            color: white;
            margin-bottom: 20px;
            line-height: 1.1;
            text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .gradient-text {
            background: linear-gradient(45deg, #fbbf24, #f59e0b, #d97706);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .hero-subtitle {
            font-size: 1.25rem;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 40px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.6;
          }

          .hero-stats {
            display: flex;
            justify-content: center;
            gap: 60px;
            flex-wrap: wrap;
          }

          .stat-item {
            text-align: center;
            color: white;
          }

          .stat-number {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 5px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }

          .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
            font-weight: 500;
          }

          .hero-decoration {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
          }

          .floating-element {
            position: absolute;
            font-size: 3rem;
            animation: float 6s ease-in-out infinite;
            opacity: 0.1;
          }

          .element-1 {
            top: 20%;
            left: 10%;
            animation-delay: 0s;
          }

          .element-2 {
            top: 60%;
            right: 15%;
            animation-delay: 2s;
          }

          .element-3 {
            bottom: 30%;
            left: 20%;
            animation-delay: 4s;
          }

          .element-4 {
            top: 40%;
            right: 30%;
            animation-delay: 1s;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }

          .categories-section {
            padding: 80px 20px;
            max-width: 1400px;
            margin: 0 auto;
          }

          .section-header {
            text-align: center;
            margin-bottom: 60px;
          }

          .section-title {
            font-size: 2.5rem;
            font-weight: 800;
            color: #1f2937;
            margin-bottom: 16px;
          }

          .section-subtitle {
            font-size: 1.125rem;
            color: #6b7280;
            max-width: 600px;
            margin: 0 auto;
          }

          .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 32px;
          }

          .category-card {
            position: relative;
            background: white;
            border-radius: 24px;
            padding: 40px 32px;
            text-align: center;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border: 2px solid transparent;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          }

          .category-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            border-color: var(--category-color);
          }

          .category-background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: var(--category-color);
            transform: scaleX(0);
            transition: transform 0.4s ease;
          }

          .category-card:hover .category-background {
            transform: scaleX(1);
          }

          .category-content {
            position: relative;
            z-index: 2;
          }

          .category-icon {
            position: relative;
            display: inline-block;
            font-size: 4rem;
            margin-bottom: 24px;
            transition: transform 0.4s ease;
          }

          .category-card:hover .category-icon {
            transform: scale(1.1) rotateY(5deg);
          }

          .icon-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            background: var(--category-color);
            border-radius: 50%;
            opacity: 0;
            filter: blur(20px);
            transition: opacity 0.4s ease;
          }

          .category-card:hover .icon-glow {
            opacity: 0.1;
          }

          .category-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 12px;
          }

          .category-description {
            font-size: 1rem;
            color: #6b7280;
            margin-bottom: 28px;
            line-height: 1.5;
          }

          .category-action {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--category-color);
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.3s ease;
          }

          .category-card:hover .category-action {
            transform: translateX(4px);
          }

          .action-arrow {
            width: 16px;
            height: 16px;
            transition: transform 0.3s ease;
          }

          .category-card:hover .action-arrow {
            transform: translateX(4px);
          }

          .features-section {
            padding: 60px 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          }

          .features-grid {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 32px;
          }

          .feature-card {
            background: white;
            padding: 32px 24px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s ease;
          }

          .feature-card:hover {
            transform: translateY(-4px);
          }

          .feature-icon {
            font-size: 3rem;
            margin-bottom: 16px;
            display: block;
          }

          .feature-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }

          .feature-text {
            color: #6b7280;
            font-size: 0.95rem;
          }

          @media (max-width: 768px) {
            .hero-stats {
              gap: 40px;
            }
            
            .categories-grid {
              grid-template-columns: 1fr;
              gap: 24px;
            }
            
            .category-card {
              padding: 32px 24px;
            }
            
            .features-grid {
              grid-template-columns: 1fr;
              gap: 24px;
            }
          }
        `}</style>
      </div>
    );
  }

  // Products view with modern design and INR pricing
  return (
    <div className="modern-products-view">
      {/* Header */}
      <div className="products-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={handleBackToCategories}>
              <svg className="back-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Categories
            </button>
          </div>

          {selectedCategory && (
            <div className="category-info">
              <div className="category-icon-small">
                {getCategoryInfo(selectedCategory.value).emoji}
              </div>
              <div className="category-details">
                <h1 className="category-title-main">{getCategoryInfo(selectedCategory.value).title}</h1>
                <p className="category-subtitle">{getCategoryInfo(selectedCategory.value).description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder={`Search in ${selectedCategory?.label || 'products'}...`}
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg className="filter-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Filters
            </button>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {usingMockData && (
        <div className="status-message demo-mode">
          <div className="status-icon">🔧</div>
          <div className="status-content">
            <strong>Demo Mode:</strong> Using sample data - ServiceNow API not available
          </div>
        </div>
      )}

      {error && (
        <div className="status-message error-mode">
          <div className="status-icon">❌</div>
          <div className="status-content">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading products...</p>
        </div>
      )}

      {/* Products Grid */}
      {sortedProducts.length === 0 && !loading ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3 className="empty-title">No products found</h3>
          <p className="empty-text">Try adjusting your search or browse other categories</p>
        </div>
      ) : (
        <div className="products-grid">
          {sortedProducts.map(product => {
            const productId = typeof product.sys_id === 'object' ? product.sys_id.value : product.sys_id;
            const name = typeof product.name === 'object' ? product.name.display_value : product.name;
            const description = typeof product.description === 'object' ? product.description.display_value : product.description;
            const category = typeof product.category === 'object' ? product.category.display_value : product.category;
            const price = typeof product.price === 'object' ? product.price.display_value : product.price;
            const unit = typeof product.unit === 'object' ? product.unit.display_value : product.unit;
            const stockQuantity = typeof product.stock_quantity === 'object' ? product.stock_quantity.display_value : product.stock_quantity;
            const inStock = parseInt(stockQuantity || 0) > 0;
            const lowStock = parseInt(stockQuantity || 0) > 0 && parseInt(stockQuantity || 0) < 10;

            return (
              <div key={productId} className={`product-card ${!inStock ? 'out-of-stock' : ''}`}>
                {!inStock && <div className="stock-badge out-of-stock-badge">Out of Stock</div>}
                {lowStock && inStock && <div className="stock-badge low-stock-badge">Only {stockQuantity} left!</div>}
                
                <div className="product-image">
                  <div className="product-icon">
                    {getProductIcon(product)}
                  </div>
                  <div className="product-icon-bg"></div>
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{name}</h3>
                  {description && <p className="product-description">{description}</p>}
                  
                  <div className="product-meta">
                    <span className="product-unit">per {unit}</span>
                  </div>
                  
                  <div className="product-footer">
                    <div className="price-section">
                      <div className="current-price">{formatPrice(price)}</div>
                    </div>
                    
                    {inStock ? (
                      <button
                        className="add-to-cart-btn"
                        data-product={productId}
                        onClick={() => handleAddToCart(product)}
                      >
                        <svg className="cart-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        Add to Cart
                      </button>
                    ) : (
                      <button className="add-to-cart-btn disabled" disabled>
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

      <style jsx>{`
        .modern-products-view {
          min-height: 100vh;
          background: #f8fafc;
        }

        .products-header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 24px 20px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }

        .back-icon {
          width: 16px;
          height: 16px;
        }

        .category-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .category-icon-small {
          font-size: 2.5rem;
        }

        .category-title-main {
          font-size: 1.875rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0;
        }

        .category-subtitle {
          color: #6b7280;
          margin: 4px 0 0 0;
          font-size: 1rem;
        }

        .search-section {
          padding: 24px 20px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .search-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          font-size: 16px;
          background: #f9fafb;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .filter-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-toggle:hover,
        .filter-toggle.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .filter-icon {
          width: 16px;
          height: 16px;
        }

        .sort-select {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .sort-select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .status-message {
          max-width: 1400px;
          margin: 20px auto;
          padding: 16px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }

        .demo-mode {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fbbf24;
        }

        .error-mode {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #f87171;
        }

        .status-icon {
          font-size: 1.25rem;
        }

        .loading-state {
          text-align: center;
          padding: 80px 20px;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        .loading-text {
          color: #6b7280;
          font-size: 1.125rem;
          font-weight: 500;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 24px;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .empty-text {
          color: #6b7280;
          font-size: 1.125rem;
        }

        .products-grid {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 20px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .product-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: #d1d5db;
        }

        .product-card.out-of-stock {
          opacity: 0.7;
          background: #f9fafb;
        }

        .stock-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          z-index: 2;
        }

        .out-of-stock-badge {
          background: #fee2e2;
          color: #dc2626;
        }

        .low-stock-badge {
          background: #fef3c7;
          color: #d97706;
        }

        .product-image {
          position: relative;
          text-align: center;
          margin-bottom: 20px;
        }

        .product-icon {
          font-size: 4rem;
          position: relative;
          z-index: 2;
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-icon {
          transform: scale(1.1);
        }

        .product-icon-bg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .product-card:hover .product-icon-bg {
          opacity: 1;
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .product-description {
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0 0 16px 0;
        }

        .product-meta {
          margin-bottom: 20px;
        }

        .product-unit {
          background: #f0f9ff;
          color: #0369a1;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .price-section {
          flex: 1;
        }

        .current-price {
          font-size: 1.5rem;
          font-weight: 800;
          color: #059669;
        }

        .add-to-cart-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .add-to-cart-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
        }

        .add-to-cart-btn.disabled {
          background: #9ca3af;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .cart-icon {
          width: 16px;
          height: 16px;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .search-container {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            min-width: auto;
          }
          
          .filter-controls {
            flex-wrap: wrap;
          }
          
          .products-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .product-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          
          .add-to-cart-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
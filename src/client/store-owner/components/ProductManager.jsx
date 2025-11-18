import React, { useState, useEffect } from 'react';
import { ProductService } from '../../services/ProductService.js';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    unit: '',
    stock_quantity: '',
    active: true
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const productService = new ProductService();

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
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoryList = await productService.getCategories();
      setCategories(categoryList);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (searchTerm) filters.search = searchTerm;
      
      const productList = await productService.getProducts(filters);
      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
      showMessage('error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      unit: '',
      stock_quantity: '',
      active: true
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct, formData);
        showMessage('success', 'Product updated successfully!');
      } else {
        await productService.createProduct(formData);
        showMessage('success', 'Product created successfully!');
      }
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showMessage('error', 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    const name = typeof product.name === 'object' ? product.name.display_value : product.name;
    const description = typeof product.description === 'object' ? product.description.display_value : product.description;
    const category = typeof product.category === 'object' ? product.category.value : product.category;
    const price = typeof product.price === 'object' ? product.price.display_value : product.price;
    const unit = typeof product.unit === 'object' ? product.unit.display_value : product.unit;
    const stockQuantity = typeof product.stock_quantity === 'object' ? product.stock_quantity.display_value : product.stock_quantity;
    const active = String(typeof product.active === 'object' ? product.active.display_value : product.active) === 'true';

    setFormData({
      name: name || '',
      description: description || '',
      category: category || '',
      price: price || '',
      unit: unit || '',
      stock_quantity: stockQuantity || '',
      active: active
    });
    
    const productId = typeof product.sys_id === 'object' ? product.sys_id.value : product.sys_id;
    setEditingProduct(productId);
    setShowAddForm(true);
  };

  const handleDelete = async (product) => {
    const productName = typeof product.name === 'object' ? product.name.display_value : product.name;
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      const productId = typeof product.sys_id === 'object' ? product.sys_id.value : product.sys_id;
      await productService.deleteProduct(productId);
      showMessage('success', 'Product deleted successfully!');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showMessage('error', 'Failed to delete product');
    }
  };

  const getCategoryInfo = (categoryValue) => {
    const categoryMap = {
      groceries: { emoji: '🛒', label: 'Groceries & Staples', color: '#ef4444' },
      vegetables: { emoji: '🥬', label: 'Fresh Vegetables', color: '#10b981' },
      fruits: { emoji: '🥭', label: 'Fresh Fruits', color: '#f59e0b' },
      dairy: { emoji: '🥛', label: 'Dairy Products', color: '#3b82f6' },
      meat: { emoji: '🍖', label: 'Meat & Seafood', color: '#8b5cf6' },
      beverages: { emoji: '☕', label: 'Beverages', color: '#06b6d4' },
      household: { emoji: '🧽', label: 'Household Items', color: '#84cc16' },
      personal_care: { emoji: '🧴', label: 'Personal Care', color: '#ec4899' },
      spices: { emoji: '🌶️', label: 'Spices & Masalas', color: '#dc2626' }
    };
    return categoryMap[categoryValue] || { emoji: '📦', label: categoryValue, color: '#6b7280' };
  };

  const getProductIcon = (product) => {
    const name = (typeof product.name === 'object' ? product.name.display_value : product.name || '').toLowerCase();
    
    const iconMap = {
      'mango': '🥭', 'banana': '🍌', 'pomegranate': '🟣', 'orange': '🍊', 'grapes': '🍇',
      'tomato': '🍅', 'onion': '🧅', 'potato': '🥔', 'okra': '🫛', 'spinach': '🥬',
      'milk': '🥛', 'paneer': '🧀', 'curd': '🥛', 'ghee': '🧈',
      'chicken': '🐔', 'mutton': '🐑', 'fish': '🐟',
      'rice': '🍚', 'atta': '🌾', 'dal': '🫘', 'oil': '🫗',
      'turmeric': '🟡', 'chili': '🌶️', 'masala': '🌶️',
      'tea': '🍵', 'coconut': '🥥', 'lassi': '🥛', 'water': '💧'
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) return icon;
    }
    
    const category = typeof product.category === 'object' ? product.category.display_value : product.category;
    return getCategoryInfo(category).emoji;
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aVal = typeof a[sortBy] === 'object' ? a[sortBy].display_value : a[sortBy];
    const bVal = typeof b[sortBy] === 'object' ? b[sortBy].display_value : b[sortBy];
    
    if (sortBy === 'price' || sortBy === 'stock_quantity') {
      return parseFloat(aVal || 0) - parseFloat(bVal || 0);
    }
    return (aVal || '').toString().localeCompare((bVal || '').toString());
  });

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchTerm]);

  return (
    <div className="modern-product-manager">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">Product Management</h1>
            <p className="page-subtitle">Manage your store inventory with Indian products and INR pricing</p>
          </div>
          <button className="add-product-btn" onClick={() => setShowAddForm(true)}>
            <svg className="add-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Product
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`modern-alert ${message.type}`}>
          <div className="alert-icon">
            {message.type === 'error' ? '❌' : '✅'}
          </div>
          <div className="alert-content">{message.text}</div>
          <button className="alert-close" onClick={() => setMessage({ type: '', text: '' })}>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="controls-section">
        <div className="filters-row">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {getCategoryInfo(category.value).emoji} {category.label}
              </option>
            ))}
          </select>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock_quantity">Sort by Stock</option>
          </select>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button className="modal-close" onClick={resetForm}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="product-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Product Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {getCategoryInfo(category.value).emoji} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Price (₹) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="Enter price in INR"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Unit <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="piece">Piece</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="litre">Litre</option>
                    <option value="dozen">Dozen</option>
                    <option value="pack">Pack</option>
                    <option value="gram">Gram (g)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Stock Quantity <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                    placeholder="Available quantity"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Product description (optional)"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Active Product</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Display */}
      <div className="products-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3 className="empty-title">No products found</h3>
            <p className="empty-text">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filters' 
                : 'Add your first product to get started'}
            </p>
            {!searchTerm && !selectedCategory && (
              <button className="empty-action-btn" onClick={() => setShowAddForm(true)}>
                <svg className="add-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className={`products-container ${viewMode}`}>
            {sortedProducts.map(product => {
              const productId = typeof product.sys_id === 'object' ? product.sys_id.value : product.sys_id;
              const name = typeof product.name === 'object' ? product.name.display_value : product.name;
              const description = typeof product.description === 'object' ? product.description.display_value : product.description;
              const category = typeof product.category === 'object' ? product.category.display_value : product.category;
              const price = typeof product.price === 'object' ? product.price.display_value : product.price;
              const unit = typeof product.unit === 'object' ? product.unit.display_value : product.unit;
              const stockQuantity = typeof product.stock_quantity === 'object' ? product.stock_quantity.display_value : product.stock_quantity;
              const active = String(typeof product.active === 'object' ? product.active.display_value : product.active) === 'true';
              const categoryInfo = getCategoryInfo(category);
              const isLowStock = parseInt(stockQuantity || 0) < 10 && parseInt(stockQuantity || 0) > 0;
              const isOutOfStock = parseInt(stockQuantity || 0) <= 0;

              return (
                <div key={productId} className={`product-card ${!active ? 'inactive' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}>
                  <div className="card-badges">
                    {!active && <div className="badge inactive-badge">Inactive</div>}
                    {isOutOfStock && <div className="badge stock-badge out">Out of Stock</div>}
                    {isLowStock && <div className="badge stock-badge low">Low Stock</div>}
                  </div>

                  <div className="product-header">
                    <div className="product-icon" style={{ color: categoryInfo.color }}>
                      {getProductIcon(product)}
                    </div>
                    <div className="category-badge" style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}>
                      {categoryInfo.emoji} {categoryInfo.label}
                    </div>
                  </div>

                  <div className="product-body">
                    <h3 className="product-name">{name}</h3>
                    {description && <p className="product-description">{description}</p>}
                    
                    <div className="product-metrics">
                      <div className="metric-item price-metric">
                        <span className="metric-label">Price</span>
                        <span className="metric-value price">{formatPrice(price)}</span>
                        <span className="metric-unit">per {unit}</span>
                      </div>
                      
                      <div className="metric-item stock-metric">
                        <span className="metric-label">Stock</span>
                        <span className={`metric-value stock ${isLowStock ? 'low' : isOutOfStock ? 'out' : ''}`}>
                          {stockQuantity}
                        </span>
                        <span className="metric-unit">{unit}s available</span>
                      </div>
                    </div>
                  </div>

                  <div className="product-actions">
                    <button className="action-btn edit-btn" onClick={() => handleEdit(product)}>
                      <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    
                    <button className="action-btn delete-btn" onClick={() => handleDelete(product)}>
                      <svg className="action-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .modern-product-manager {
          background: #f8fafc;
          min-height: 100vh;
        }

        .page-header {
          background: white;
          padding: 32px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .page-subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 1rem;
        }

        .add-product-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .add-product-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
        }

        .add-icon {
          width: 16px;
          height: 16px;
        }

        .modern-alert {
          margin: 0 0 24px 0;
          padding: 16px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          position: relative;
        }

        .modern-alert.error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .modern-alert.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .alert-icon {
          font-size: 1.25rem;
        }

        .alert-content {
          flex: 1;
        }

        .alert-close {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .alert-close:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .alert-close svg {
          width: 16px;
          height: 16px;
        }

        .controls-section {
          background: white;
          padding: 24px 32px;
          border-radius: 16px;
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
        }

        .filters-row {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
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
          padding: 12px 16px 12px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          background: #f9fafb;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .filter-select,
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

        .filter-select:focus,
        .sort-select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .view-toggle {
          display: flex;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 2px;
        }

        .view-btn {
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
        }

        .view-btn.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .view-btn svg {
          width: 16px;
          height: 16px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .modal-close {
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .modal-close:hover {
          background: #e5e7eb;
        }

        .modal-close svg {
          width: 16px;
          height: 16px;
          color: #374151;
        }

        .product-form {
          padding: 32px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .required {
          color: #dc2626;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-input {
          width: 16px;
          height: 16px;
          accent-color: #3b82f6;
        }

        .checkbox-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-secondary {
          padding: 12px 24px;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(5, 150, 105, 0.5);
        }

        .btn-icon {
          width: 16px;
          height: 16px;
        }

        .products-section {
          background: white;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .loading-state,
        .empty-state {
          padding: 80px 32px;
          text-align: center;
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

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 24px;
          opacity: 0.5;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .empty-text {
          color: #6b7280;
          margin: 0 0 24px 0;
        }

        .empty-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .empty-action-btn:hover {
          transform: translateY(-2px);
        }

        .products-container {
          padding: 32px;
        }

        .products-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .product-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
        }

        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .product-card.inactive {
          opacity: 0.7;
          background: #f9fafb;
        }

        .product-card.out-of-stock {
          border-color: #fca5a5;
        }

        .card-badges {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 2;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
        }

        .inactive-badge {
          background: #fee2e2;
          color: #dc2626;
        }

        .stock-badge.low {
          background: #fef3c7;
          color: #d97706;
        }

        .stock-badge.out {
          background: #fee2e2;
          color: #dc2626;
        }

        .product-header {
          padding: 24px 24px 0;
          text-align: center;
        }

        .product-icon {
          font-size: 3.5rem;
          margin-bottom: 16px;
          display: block;
        }

        .category-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .product-body {
          padding: 20px 24px;
        }

        .product-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .product-description {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0 0 20px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .metric-item {
          text-align: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .metric-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .metric-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 2px;
        }

        .metric-value.price {
          color: #059669;
        }

        .metric-value.stock.low {
          color: #d97706;
        }

        .metric-value.stock.out {
          color: #dc2626;
        }

        .metric-unit {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 500;
        }

        .product-actions {
          display: flex;
          gap: 12px;
          padding: 0 24px 24px;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .edit-btn:hover {
          background: #bfdbfe;
        }

        .delete-btn {
          background: #fee2e2;
          color: #dc2626;
        }

        .delete-btn:hover {
          background: #fecaca;
        }

        .action-icon {
          width: 14px;
          height: 14px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .products-container.grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .page-header,
          .controls-section,
          .products-container {
            padding: 20px;
          }
          
          .filters-row {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            min-width: auto;
          }
          
          .product-metrics {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
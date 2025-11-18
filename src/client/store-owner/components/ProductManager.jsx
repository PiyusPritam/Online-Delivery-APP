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
      groceries: { emoji: '🛒', label: 'Groceries' },
      vegetables: { emoji: '🥬', label: 'Vegetables' },
      fruits: { emoji: '🍎', label: 'Fruits' },
      dairy: { emoji: '🥛', label: 'Dairy' },
      meat: { emoji: '🥩', label: 'Meat & Seafood' },
      beverages: { emoji: '🥤', label: 'Beverages' },
      household: { emoji: '🏠', label: 'Household' },
      personal_care: { emoji: '🧴', label: 'Personal Care' }
    };
    return categoryMap[categoryValue] || { emoji: '📦', label: categoryValue };
  };

  const getProductIcon = (product) => {
    const name = (typeof product.name === 'object' ? product.name.display_value : product.name || '').toLowerCase();
    const category = (typeof product.category === 'object' ? product.category.display_value : product.category || '').toLowerCase();

    const productIconMap = {
      'apple': '🍎', 'banana': '🍌', 'orange': '🍊', 'strawberry': '🍓', 'grapes': '🍇',
      'tomato': '🍅', 'carrot': '🥕', 'broccoli': '🥦', 'lettuce': '🥬', 'potato': '🥔',
      'milk': '🥛', 'cheese': '🧀', 'butter': '🧈', 'yogurt': '🍶',
      'chicken': '🐔', 'beef': '🥩', 'fish': '🐟', 'bread': '🍞', 'rice': '🍚',
      'coffee': '☕', 'tea': '🍵', 'juice': '🧃', 'water': '💧'
    };

    for (const [key, icon] of Object.entries(productIconMap)) {
      if (name.includes(key)) return icon;
    }

    return getCategoryInfo(category).emoji;
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchTerm]);

  return (
    <div className="main-content">
      <div className="page-header">
        <h2>Product Management</h2>
        <p>Add, edit, and manage your store inventory</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          <span>{message.type === 'error' ? '❌' : '✅'}</span>
          {message.text}
        </div>
      )}

      {/* Filters and Actions */}
      <div className="card">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="form-group" style={{ margin: 0, minWidth: '150px' }}>
            <select
              className="form-control"
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

          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <span>➕</span>
            Add Product
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card">
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleFormSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unit *</label>
                <select
                  className="form-control"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  required
                >
                  <option value="">Select Unit</option>
                  <option value="piece">Piece</option>
                  <option value="pound">Pound (lb)</option>
                  <option value="kilogram">Kilogram (kg)</option>
                  <option value="liter">Liter</option>
                  <option value="gallon">Gallon</option>
                  <option value="dozen">Dozen</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                />
                Active Product
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success">
                <span>{editingProduct ? '💾' : '➕'}</span>
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      <div className="card">
        <h3>Products ({products.length})</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📦</div>
            <h4>No products found</h4>
            <p>Add your first product to get started</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {products.map(product => {
              const productId = typeof product.sys_id === 'object' ? product.sys_id.value : product.sys_id;
              const name = typeof product.name === 'object' ? product.name.display_value : product.name;
              const description = typeof product.description === 'object' ? product.description.display_value : product.description;
              const category = typeof product.category === 'object' ? product.category.display_value : product.category;
              const price = typeof product.price === 'object' ? product.price.display_value : product.price;
              const unit = typeof product.unit === 'object' ? product.unit.display_value : product.unit;
              const stockQuantity = typeof product.stock_quantity === 'object' ? product.stock_quantity.display_value : product.stock_quantity;
              const active = String(typeof product.active === 'object' ? product.active.display_value : product.active) === 'true';

              return (
                <div key={productId} className="card" style={{ 
                  padding: '20px',
                  opacity: active ? 1 : 0.6,
                  border: active ? '1px solid #e9ecef' : '1px solid #dc3545'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                      {getProductIcon(product)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <span className={`badge badge-${getCategoryInfo(category).emoji ? 'info' : 'secondary'}`}>
                        {getCategoryInfo(category).label}
                      </span>
                      {!active && <span className="badge badge-danger">Inactive</span>}
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{name}</h4>
                  
                  {description && (
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6c757d', 
                      marginBottom: '15px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {description}
                    </p>
                  )}

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '5px'
                    }}>
                      <span style={{ fontWeight: '600', fontSize: '1.2rem', color: '#007bff' }}>
                        ${parseFloat(price || 0).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '14px', color: '#6c757d' }}>
                        per {unit}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '14px', color: parseInt(stockQuantity) < 10 ? '#dc3545' : '#28a745' }}>
                      Stock: {stockQuantity} {unit}s
                      {parseInt(stockQuantity) < 10 && (
                        <span style={{ marginLeft: '5px', fontWeight: '600' }}>⚠️ Low Stock</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEdit(product)}
                      style={{ flex: 1 }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(product)}
                      style={{ flex: 1 }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
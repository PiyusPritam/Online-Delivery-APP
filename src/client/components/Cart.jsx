import React, { useState } from 'react';
import { OrderService } from '../services/OrderService.js';
import { AddressService } from '../services/AddressService.js';

export default function Cart({ cart, onUpdateQuantity, onClearCart, currentUser }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const orderService = new OrderService();
  const addressService = new AddressService();

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

  const loadAddresses = async () => {
    if (!currentUser?.customerProfile) return;
    
    try {
      const customerSysId = typeof currentUser.customerProfile.sys_id === 'object' 
        ? currentUser.customerProfile.sys_id.value 
        : currentUser.customerProfile.sys_id;
      
      const userAddresses = await addressService.getAddressesByCustomer(customerSysId);
      setAddresses(userAddresses);
      
      // Auto-select default address
      const defaultAddr = userAddresses.find(addr => {
        const isDefault = typeof addr.is_default === 'object' ? addr.is_default.display_value : addr.is_default;
        return String(isDefault) === 'true';
      });
      if (defaultAddr) {
        const addrSysId = typeof defaultAddr.sys_id === 'object' ? defaultAddr.sys_id.value : defaultAddr.sys_id;
        setSelectedAddress(addrSysId);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  };

  React.useEffect(() => {
    loadAddresses();
  }, [currentUser]);

  const subtotal = cart.reduce((sum, item) => {
    const price = typeof item.product.price === 'object' 
      ? parseFloat(item.product.price.display_value || 0)
      : parseFloat(item.product.price || 0);
    return sum + (price * item.quantity);
  }, 0);

  const deliveryFee = 49; // ₹49 delivery fee
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !paymentMethod) {
      setError('Please select a delivery address and payment method');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const customerSysId = typeof currentUser.customerProfile.sys_id === 'object' 
        ? currentUser.customerProfile.sys_id.value 
        : currentUser.customerProfile.sys_id;

      const orderData = {
        customer: customerSysId,
        delivery_address: selectedAddress,
        payment_method: paymentMethod,
        delivery_instructions: deliveryInstructions,
        delivery_fee: deliveryFee,
        status: 'pending'
      };

      const order = await orderService.createOrder(orderData, cart);
      
      setSuccess(`Order placed successfully! Order #${typeof order.order_number === 'object' ? order.order_number.display_value : order.order_number}`);
      onClearCart();
      
      // Clear form
      setSelectedAddress('');
      setPaymentMethod('');
      setDeliveryInstructions('');
      setShowCheckout(false);
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
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
    return '📦';
  };

  if (cart.length === 0) {
    return (
      <div className="modern-empty-cart">
        <div className="empty-content">
          <div className="empty-icon">🛒</div>
          <h2 className="empty-title">Your cart is empty</h2>
          <p className="empty-subtitle">Add some fresh products to get started!</p>
          <div className="empty-suggestions">
            <div className="suggestion-item">
              <span className="suggestion-icon">🥭</span>
              <span>Fresh Fruits</span>
            </div>
            <div className="suggestion-item">
              <span className="suggestion-icon">🥬</span>
              <span>Vegetables</span>
            </div>
            <div className="suggestion-item">
              <span className="suggestion-icon">🥛</span>
              <span>Dairy Products</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          .modern-empty-cart {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 40px 20px;
          }

          .empty-content {
            text-align: center;
            max-width: 500px;
          }

          .empty-icon {
            font-size: 6rem;
            margin-bottom: 24px;
            opacity: 0.6;
          }

          .empty-title {
            font-size: 2rem;
            font-weight: 800;
            color: #1f2937;
            margin-bottom: 12px;
          }

          .empty-subtitle {
            font-size: 1.125rem;
            color: #6b7280;
            margin-bottom: 32px;
          }

          .empty-suggestions {
            display: flex;
            gap: 24px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .suggestion-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 16px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s ease;
            cursor: pointer;
          }

          .suggestion-item:hover {
            transform: translateY(-2px);
          }

          .suggestion-icon {
            font-size: 2rem;
          }

          .suggestion-item span:last-child {
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
          }

          @media (max-width: 640px) {
            .empty-suggestions {
              flex-direction: column;
              align-items: center;
            }
            
            .suggestion-item {
              flex-direction: row;
              width: 100%;
              max-width: 200px;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="modern-cart">
      <div className="cart-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="cart-title">Shopping Cart</h1>
            <p className="cart-subtitle">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <button className="clear-cart-btn" onClick={onClearCart}>
            <svg className="clear-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Clear Cart
          </button>
        </div>
      </div>

      {error && (
        <div className="alert error-alert">
          <div className="alert-icon">❌</div>
          <div className="alert-content">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {success && (
        <div className="alert success-alert">
          <div className="alert-icon">✅</div>
          <div className="alert-content">
            <strong>Success:</strong> {success}
          </div>
        </div>
      )}

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          {cart.map(item => {
            const productId = typeof item.product.sys_id === 'object' 
              ? item.product.sys_id.value 
              : item.product.sys_id;
            const name = typeof item.product.name === 'object' 
              ? item.product.name.display_value 
              : item.product.name;
            const price = typeof item.product.price === 'object' 
              ? parseFloat(item.product.price.display_value || 0)
              : parseFloat(item.product.price || 0);
            const unit = typeof item.product.unit === 'object' 
              ? item.product.unit.display_value 
              : item.product.unit;
            const description = typeof item.product.description === 'object' 
              ? item.product.description.display_value 
              : item.product.description;

            const itemTotal = price * item.quantity;

            return (
              <div key={productId} className="cart-item">
                <div className="item-image">
                  <div className="product-icon">
                    {getProductIcon(item.product)}
                  </div>
                </div>

                <div className="item-details">
                  <h3 className="item-name">{name}</h3>
                  {description && <p className="item-description">{description}</p>}
                  <div className="item-meta">
                    <span className="price-per-unit">{formatPrice(price)} per {unit}</span>
                  </div>
                </div>

                <div className="item-controls">
                  <div className="quantity-section">
                    <label className="quantity-label">Quantity</label>
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn decrease"
                        onClick={() => onUpdateQuantity(productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="quantity-btn increase"
                        onClick={() => onUpdateQuantity(productId, item.quantity + 1)}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="item-price">
                    <span className="price-label">Total</span>
                    <span className="price-value">{formatPrice(itemTotal)}</span>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => onUpdateQuantity(productId, 0)}
                    title="Remove item"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="order-sidebar">
          <div className="order-summary">
            <h2 className="summary-title">Order Summary</h2>
            
            <div className="summary-details">
              <div className="summary-line">
                <span>Subtotal ({cart.length} items)</span>
                <span className="summary-amount">{formatPrice(subtotal)}</span>
              </div>
              
              <div className="summary-line">
                <span>Delivery Fee</span>
                <span className="summary-amount">{formatPrice(deliveryFee)}</span>
              </div>
              
              <div className="summary-line total-line">
                <span>Total Amount</span>
                <span className="total-amount">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="delivery-info">
              <div className="delivery-badge">
                <span className="delivery-icon">🚚</span>
                <span>30-min delivery</span>
              </div>
              <p className="delivery-text">Free delivery on orders above ₹299</p>
            </div>

            {!showCheckout ? (
              <button 
                className="checkout-btn"
                onClick={() => setShowCheckout(true)}
              >
                Proceed to Checkout
                <svg className="checkout-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <div className="checkout-form">
                <h3 className="form-title">Checkout Details</h3>
                
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-text">Delivery Address</span>
                    <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    required
                  >
                    <option value="">Select delivery address</option>
                    {addresses.map(address => {
                      const addressId = typeof address.sys_id === 'object' ? address.sys_id.value : address.sys_id;
                      const line1 = typeof address.address_line_1 === 'object' ? address.address_line_1.display_value : address.address_line_1;
                      const city = typeof address.city === 'object' ? address.city.display_value : address.city;
                      const state = typeof address.state === 'object' ? address.state.display_value : address.state;
                      
                      return (
                        <option key={addressId} value={addressId}>
                          {line1}, {city}, {state}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-text">Payment Method</span>
                    <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="upi">UPI (PhonePe, GPay, Paytm)</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="net_banking">Net Banking</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-text">Delivery Instructions</span>
                    <span className="optional">(Optional)</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Any specific instructions for delivery..."
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    className="back-btn"
                    onClick={() => setShowCheckout(false)}
                  >
                    Back
                  </button>
                  <button
                    className="place-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading || !selectedAddress || !paymentMethod}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order {formatPrice(total)}
                        <svg className="order-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modern-cart {
          min-height: 100vh;
          background: #f8fafc;
          padding: 24px 20px;
        }

        .cart-header {
          max-width: 1400px;
          margin: 0 auto 32px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
        }

        .cart-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .cart-subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 1rem;
        }

        .clear-cart-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-cart-btn:hover {
          background: #fca5a5;
          transform: translateY(-1px);
        }

        .clear-icon {
          width: 16px;
          height: 16px;
        }

        .alert {
          max-width: 1400px;
          margin: 0 auto 24px;
          padding: 16px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }

        .error-alert {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .success-alert {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .alert-icon {
          font-size: 1.25rem;
        }

        .cart-layout {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 32px;
          align-items: start;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cart-item {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 20px;
          align-items: center;
          transition: box-shadow 0.2s ease;
        }

        .cart-item:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .item-image {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-icon {
          font-size: 3rem;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 16px;
          border: 2px solid #e5e7eb;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .item-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .item-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .price-per-unit {
          background: #f0f9ff;
          color: #0369a1;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .item-controls {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 16px;
          min-width: 160px;
        }

        .quantity-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .quantity-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          background: #f3f4f6;
          border-radius: 12px;
          overflow: hidden;
        }

        .quantity-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quantity-btn:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-btn svg {
          width: 16px;
          height: 16px;
        }

        .quantity-value {
          min-width: 40px;
          text-align: center;
          font-weight: 600;
          color: #1f2937;
          padding: 0 8px;
        }

        .item-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .price-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .price-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: #059669;
        }

        .remove-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          background: #fca5a5;
        }

        .remove-btn svg {
          width: 16px;
          height: 16px;
        }

        .order-sidebar {
          position: sticky;
          top: 20px;
        }

        .order-summary {
          background: white;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }

        .summary-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 20px 0;
        }

        .summary-details {
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 0.95rem;
        }

        .summary-line:last-child {
          margin-bottom: 0;
        }

        .summary-amount {
          font-weight: 600;
          color: #374151;
        }

        .total-line {
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          margin-top: 12px;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .total-amount {
          color: #059669;
          font-size: 1.25rem;
        }

        .delivery-info {
          background: #f0f9ff;
          padding: 16px;
          border-radius: 12px;
          margin: 20px 0;
          text-align: center;
        }

        .delivery-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #0369a1;
          margin-bottom: 8px;
        }

        .delivery-icon {
          font-size: 1rem;
        }

        .delivery-text {
          color: #0369a1;
          font-size: 0.875rem;
          margin: 0;
        }

        .checkout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .checkout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
        }

        .checkout-arrow {
          width: 20px;
          height: 20px;
        }

        .checkout-form {
          margin-top: 20px;
        }

        .form-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 20px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .required {
          color: #dc2626;
        }

        .optional {
          color: #6b7280;
          font-weight: 400;
        }

        .form-select,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.875rem;
          background: white;
          transition: border-color 0.2s ease;
        }

        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .back-btn {
          flex: 1;
          padding: 12px 20px;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: #e5e7eb;
        }

        .place-order-btn {
          flex: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
        }

        .place-order-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(5, 150, 105, 0.5);
        }

        .place-order-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .order-icon {
          width: 16px;
          height: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .cart-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .order-sidebar {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .modern-cart {
            padding: 16px 12px;
          }
          
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }
          
          .clear-cart-btn {
            align-self: flex-start;
          }
          
          .cart-item {
            grid-template-columns: 1fr;
            gap: 16px;
            text-align: center;
          }
          
          .item-controls {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          
          .quantity-section {
            flex-direction: row;
            gap: 12px;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
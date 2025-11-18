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

  const orderService = new OrderService();
  const addressService = new AddressService();

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

  const deliveryFee = 5.99;
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
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-content">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart ({cart.length} items)</h2>
        <button className="btn btn-secondary" onClick={onClearCart}>
          Clear Cart
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="cart-content">
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

            return (
              <div key={productId} className="cart-item card">
                <div className="cart-item-info">
                  <h4>{name}</h4>
                  <p>${price.toFixed(2)} per {unit}</p>
                </div>
                
                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button
                      className="btn btn-secondary quantity-btn"
                      onClick={() => onUpdateQuantity(productId, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="btn btn-secondary quantity-btn"
                      onClick={() => onUpdateQuantity(productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="item-total">
                    <strong>${(price * item.quantity).toFixed(2)}</strong>
                  </div>
                  
                  <button
                    className="btn btn-danger remove-btn"
                    onClick={() => onUpdateQuantity(productId, 0)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="checkout-section">
          <div className="checkout-form card">
            <h3>Checkout Information</h3>
            
            <div className="form-group">
              <label className="form-label">Delivery Address</label>
              <select
                className="form-control"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                required
              >
                <option value="">Select an address</option>
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
              <label className="form-label">Payment Method</label>
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="">Select payment method</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Instructions (Optional)</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Special instructions for delivery..."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
              />
            </div>
          </div>

          <div className="order-summary card">
            <h3>Order Summary</h3>
            
            <div className="summary-line">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-line">
              <span>Delivery Fee:</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            
            <div className="summary-line total-line">
              <strong>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </strong>
            </div>

            <button
              className="btn btn-success place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress || !paymentMethod}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
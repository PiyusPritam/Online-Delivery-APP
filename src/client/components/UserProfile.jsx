import React, { useState, useEffect } from 'react';
import { AddressService } from '../services/AddressService.js';

export default function UserProfile({ currentUser, onUpdateUser }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    address_type: 'home',
    is_default: false
  });

  const addressService = new AddressService();

  useEffect(() => {
    loadAddresses();
  }, [currentUser]);

  const loadAddresses = async () => {
    if (!currentUser?.customerProfile) return;

    try {
      const customerSysId = typeof currentUser.customerProfile.sys_id === 'object' 
        ? currentUser.customerProfile.sys_id.value 
        : currentUser.customerProfile.sys_id;
      
      const addressList = await addressService.getAddressesByCustomer(customerSysId);
      setAddresses(addressList);
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const customerSysId = typeof currentUser.customerProfile.sys_id === 'object' 
        ? currentUser.customerProfile.sys_id.value 
        : currentUser.customerProfile.sys_id;

      const addressData = {
        ...addressForm,
        customer: customerSysId
      };

      if (editingAddress) {
        const addressSysId = typeof editingAddress.sys_id === 'object' 
          ? editingAddress.sys_id.value 
          : editingAddress.sys_id;
        await addressService.updateAddress(addressSysId, addressData);
        setSuccess('Address updated successfully!');
      } else {
        await addressService.createAddress(addressData);
        setSuccess('Address added successfully!');
      }

      // If setting as default, update all other addresses
      if (addressForm.is_default) {
        if (editingAddress) {
          const addressSysId = typeof editingAddress.sys_id === 'object' 
            ? editingAddress.sys_id.value 
            : editingAddress.sys_id;
          await addressService.setDefaultAddress(customerSysId, addressSysId);
        }
      }

      await loadAddresses();
      resetAddressForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      address_line_1: typeof address.address_line_1 === 'object' ? address.address_line_1.display_value : address.address_line_1,
      address_line_2: typeof address.address_line_2 === 'object' ? address.address_line_2.display_value : address.address_line_2 || '',
      city: typeof address.city === 'object' ? address.city.display_value : address.city,
      state: typeof address.state === 'object' ? address.state.display_value : address.state,
      zip_code: typeof address.zip_code === 'object' ? address.zip_code.display_value : address.zip_code,
      country: typeof address.country === 'object' ? address.country.display_value : address.country,
      address_type: typeof address.address_type === 'object' ? address.address_type.value : address.address_type,
      is_default: String(typeof address.is_default === 'object' ? address.is_default.display_value : address.is_default) === 'true'
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (address) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const addressSysId = typeof address.sys_id === 'object' ? address.sys_id.value : address.sys_id;
      await addressService.deleteAddress(addressSysId);
      await loadAddresses();
      setSuccess('Address deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete address');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'United States',
      address_type: 'home',
      is_default: false
    });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>Manage your account information and delivery addresses</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-sections">
        {/* User Information Section */}
        <div className="profile-section card">
          <h3>Account Information</h3>
          <div className="user-info-display">
            <div className="info-group">
              <label>Name:</label>
              <span>{typeof currentUser?.name === 'object' ? currentUser.name.display_value : currentUser?.name}</span>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <span>{typeof currentUser?.email === 'object' ? currentUser.email.display_value : currentUser?.email}</span>
            </div>
            <div className="info-group">
              <label>Username:</label>
              <span>{typeof currentUser?.user_name === 'object' ? currentUser.user_name.display_value : currentUser?.user_name}</span>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="profile-section card">
          <div className="section-header">
            <h3>Delivery Addresses</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddressForm(true)}
            >
              Add New Address
            </button>
          </div>

          {showAddressForm && (
            <div className="address-form card">
              <div className="form-header">
                <h4>{editingAddress ? 'Edit Address' : 'Add New Address'}</h4>
                <button 
                  className="btn btn-secondary"
                  onClick={resetAddressForm}
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveAddress}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Address Line 1</label>
                    <input
                      type="text"
                      name="address_line_1"
                      className="form-control"
                      value={addressForm.address_line_1}
                      onChange={handleAddressFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address Line 2</label>
                    <input
                      type="text"
                      name="address_line_2"
                      className="form-control"
                      value={addressForm.address_line_2}
                      onChange={handleAddressFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={addressForm.city}
                      onChange={handleAddressFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-control"
                      value={addressForm.state}
                      onChange={handleAddressFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP Code</label>
                    <input
                      type="text"
                      name="zip_code"
                      className="form-control"
                      value={addressForm.zip_code}
                      onChange={handleAddressFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Address Type</label>
                    <select
                      name="address_type"
                      className="form-control"
                      value={addressForm.address_type}
                      onChange={handleAddressFormChange}
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={addressForm.is_default}
                        onChange={handleAddressFormChange}
                      />
                      Set as default address
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="addresses-list">
            {addresses.length === 0 ? (
              <p>No addresses added yet. Add your first delivery address above.</p>
            ) : (
              addresses.map(address => {
                const addressId = typeof address.sys_id === 'object' ? address.sys_id.value : address.sys_id;
                const line1 = typeof address.address_line_1 === 'object' ? address.address_line_1.display_value : address.address_line_1;
                const line2 = typeof address.address_line_2 === 'object' ? address.address_line_2.display_value : address.address_line_2;
                const city = typeof address.city === 'object' ? address.city.display_value : address.city;
                const state = typeof address.state === 'object' ? address.state.display_value : address.state;
                const zipCode = typeof address.zip_code === 'object' ? address.zip_code.display_value : address.zip_code;
                const addressType = typeof address.address_type === 'object' ? address.address_type.display_value : address.address_type;
                const isDefault = String(typeof address.is_default === 'object' ? address.is_default.display_value : address.is_default) === 'true';

                return (
                  <div key={addressId} className={`address-card card ${isDefault ? 'default-address' : ''}`}>
                    <div className="address-info">
                      <div className="address-text">
                        <strong>{line1}</strong>
                        {line2 && <div>{line2}</div>}
                        <div>{city}, {state} {zipCode}</div>
                        <div className="address-meta">
                          <span className="address-type">{addressType.charAt(0).toUpperCase() + addressType.slice(1)}</span>
                          {isDefault && <span className="default-badge">Default</span>}
                        </div>
                      </div>
                      <div className="address-actions">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleEditAddress(address)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteAddress(address)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
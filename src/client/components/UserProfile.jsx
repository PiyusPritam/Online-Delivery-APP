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

  const getAddressTypeIcon = (type) => {
    const iconMap = {
      'home': '🏠',
      'work': '🏢',
      'other': '📍'
    };
    return iconMap[type] || '📍';
  };

  return (
    <div className="modern-user-profile">
      {/* Header */}
      <div className="profile-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Manage your account information and delivery addresses</p>
          </div>
          <div className="user-avatar">
            <div className="avatar-circle">
              {(currentUser?.customerProfile?.first_name?.display_value || currentUser?.name?.display_value || 'U')[0].toUpperCase()}
            </div>
          </div>
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

      <div className="profile-layout">
        {/* User Information Section */}
        <div className="profile-card account-info-card">
          <div className="card-header">
            <div className="header-icon">👤</div>
            <div className="header-text">
              <h3 className="card-title">Account Information</h3>
              <p className="card-subtitle">Your personal details</p>
            </div>
          </div>
          
          <div className="card-content">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">📛</div>
                <div className="info-details">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">
                    {currentUser?.customerProfile ? 
                      `${currentUser.customerProfile.first_name?.display_value || ''} ${currentUser.customerProfile.last_name?.display_value || ''}`.trim() :
                      (typeof currentUser?.name === 'object' ? currentUser.name.display_value : currentUser?.name) || 'Not provided'
                    }
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📧</div>
                <div className="info-details">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">
                    {currentUser?.customerProfile?.email?.display_value || 
                     (typeof currentUser?.email === 'object' ? currentUser.email.display_value : currentUser?.email) || 
                     'Not provided'}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">👤</div>
                <div className="info-details">
                  <span className="info-label">Username</span>
                  <span className="info-value">
                    {typeof currentUser?.user_name === 'object' ? currentUser.user_name.display_value : currentUser?.user_name || 'Not provided'}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📱</div>
                <div className="info-details">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">
                    {currentUser?.customerProfile?.phone?.display_value || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="profile-card addresses-card">
          <div className="card-header">
            <div className="header-icon">📍</div>
            <div className="header-text">
              <h3 className="card-title">Delivery Addresses</h3>
              <p className="card-subtitle">Manage your saved addresses</p>
            </div>
            <button 
              className="add-address-btn"
              onClick={() => setShowAddressForm(true)}
            >
              <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              Add Address
            </button>
          </div>

          <div className="card-content">
            {showAddressForm && (
              <div className="address-form">
                <div className="form-header">
                  <h4 className="form-title">{editingAddress ? 'Edit Address' : 'Add New Address'}</h4>
                  <button 
                    className="close-form-btn"
                    onClick={resetAddressForm}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="address-form-content">
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">
                        <span className="label-text">Address Line 1</span>
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="address_line_1"
                        className="form-input"
                        placeholder="Enter street address"
                        value={addressForm.address_line_1}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">
                        <span className="label-text">Address Line 2</span>
                        <span className="optional">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="address_line_2"
                        className="form-input"
                        placeholder="Apartment, suite, unit, building, floor, etc."
                        value={addressForm.address_line_2}
                        onChange={handleAddressFormChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-text">City</span>
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        className="form-input"
                        placeholder="Enter city"
                        value={addressForm.city}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-text">State</span>
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        className="form-input"
                        placeholder="Enter state"
                        value={addressForm.state}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-text">ZIP Code</span>
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="zip_code"
                        className="form-input"
                        placeholder="Enter ZIP code"
                        value={addressForm.zip_code}
                        onChange={handleAddressFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-text">Address Type</span>
                      </label>
                      <select
                        name="address_type"
                        className="form-select"
                        value={addressForm.address_type}
                        onChange={handleAddressFormChange}
                      >
                        <option value="home">🏠 Home</option>
                        <option value="work">🏢 Work</option>
                        <option value="other">📍 Other</option>
                      </select>
                    </div>

                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="is_default"
                          className="checkbox-input"
                          checked={addressForm.is_default}
                          onChange={handleAddressFormChange}
                        />
                        <span className="checkbox-text">Set as default delivery address</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button"
                      className="cancel-btn"
                      onClick={resetAddressForm}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="save-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          Save Address
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="addresses-list">
              {addresses.length === 0 ? (
                <div className="empty-addresses">
                  <div className="empty-icon">📍</div>
                  <h4 className="empty-title">No addresses saved</h4>
                  <p className="empty-subtitle">Add your first delivery address to get started with orders</p>
                  <button 
                    className="empty-add-btn"
                    onClick={() => setShowAddressForm(true)}
                  >
                    <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="addresses-grid">
                  {addresses.map(address => {
                    const addressId = typeof address.sys_id === 'object' ? address.sys_id.value : address.sys_id;
                    const line1 = typeof address.address_line_1 === 'object' ? address.address_line_1.display_value : address.address_line_1;
                    const line2 = typeof address.address_line_2 === 'object' ? address.address_line_2.display_value : address.address_line_2;
                    const city = typeof address.city === 'object' ? address.city.display_value : address.city;
                    const state = typeof address.state === 'object' ? address.state.display_value : address.state;
                    const zipCode = typeof address.zip_code === 'object' ? address.zip_code.display_value : address.zip_code;
                    const addressType = typeof address.address_type === 'object' ? address.address_type.value : address.address_type;
                    const addressTypeDisplay = typeof address.address_type === 'object' ? address.address_type.display_value : address.address_type;
                    const isDefault = String(typeof address.is_default === 'object' ? address.is_default.display_value : address.is_default) === 'true';

                    return (
                      <div key={addressId} className={`address-card ${isDefault ? 'default-address' : ''}`}>
                        <div className="address-header">
                          <div className="address-type-badge">
                            <span className="type-icon">{getAddressTypeIcon(addressType)}</span>
                            <span className="type-text">{addressTypeDisplay?.charAt(0).toUpperCase() + addressTypeDisplay?.slice(1)}</span>
                          </div>
                          {isDefault && (
                            <div className="default-badge">
                              <span className="badge-icon">⭐</span>
                              <span>Default</span>
                            </div>
                          )}
                        </div>

                        <div className="address-content">
                          <div className="address-text">
                            <div className="address-line primary">{line1}</div>
                            {line2 && <div className="address-line secondary">{line2}</div>}
                            <div className="address-line location">{city}, {state} {zipCode}</div>
                          </div>
                        </div>

                        <div className="address-actions">
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => handleEditAddress(address)}
                            title="Edit address"
                          >
                            <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                            </svg>
                            Edit
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteAddress(address)}
                            title="Delete address"
                          >
                            <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
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
          </div>
        </div>
      </div>

      <style jsx>{`
        .modern-user-profile {
          min-height: 100vh;
          background: #f8fafc;
          padding: 24px 20px;
        }

        /* Header */
        .profile-header {
          max-width: 1200px;
          margin: 0 auto 32px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .page-subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 1.125rem;
        }

        .user-avatar {
          display: flex;
          align-items: center;
        }

        .avatar-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
        }

        /* Alert Styles */
        .alert {
          max-width: 1200px;
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

        /* Layout */
        .profile-layout {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .profile-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px 24px 0;
          margin-bottom: 24px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border: 2px solid #3b82f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .header-text {
          flex: 1;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .card-subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 0.875rem;
        }

        .card-content {
          padding: 0 24px 24px;
        }

        /* Account Info Styles */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .info-details {
          flex: 1;
        }

        .info-label {
          display: block;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .info-value {
          display: block;
          color: #1f2937;
          font-weight: 600;
          font-size: 1rem;
        }

        /* Add Address Button */
        .add-address-btn {
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

        .add-address-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
        }

        .btn-icon {
          width: 16px;
          height: 16px;
        }

        /* Address Form */
        .address-form {
          background: #f8fafc;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .close-form-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-form-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .close-form-btn svg {
          width: 16px;
          height: 16px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group.checkbox-group {
          grid-column: 1 / -1;
          margin-top: 8px;
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

        .form-input,
        .form-select {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.875rem;
          background: white;
          transition: all 0.2s ease;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 16px;
          background: white;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .checkbox-label:hover {
          border-color: #3b82f6;
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          accent-color: #3b82f6;
        }

        .checkbox-text {
          font-weight: 500;
          color: #374151;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .cancel-btn {
          padding: 12px 24px;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        .save-btn {
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

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(5, 150, 105, 0.5);
        }

        .save-btn:disabled {
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Empty State */
        .empty-addresses {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 24px;
          opacity: 0.6;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 12px 0;
        }

        .empty-subtitle {
          color: #6b7280;
          margin: 0 0 32px 0;
          font-size: 1rem;
        }

        .empty-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .empty-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
        }

        /* Addresses Grid */
        .addresses-grid {
          display: grid;
          gap: 20px;
        }

        .address-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .address-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
          transform: translateY(-2px);
        }

        .address-card.default-address {
          border-color: #fbbf24;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }

        .address-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .address-type-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #f0f9ff;
          color: #1d4ed8;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .type-icon {
          font-size: 1rem;
        }

        .default-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #fbbf24;
          color: white;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-icon {
          font-size: 0.875rem;
        }

        .address-content {
          margin-bottom: 20px;
        }

        .address-line {
          margin-bottom: 4px;
          line-height: 1.5;
        }

        .address-line.primary {
          font-weight: 700;
          color: #1f2937;
          font-size: 1rem;
        }

        .address-line.secondary {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .address-line.location {
          color: #374151;
          font-weight: 500;
        }

        .address-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: white;
          color: #374151;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #f3f4f6;
          transform: translateY(-1px);
        }

        .edit-btn {
          color: #3b82f6;
          border-color: #3b82f6;
        }

        .edit-btn:hover {
          background: #eff6ff;
        }

        .delete-btn {
          color: #dc2626;
          border-color: #dc2626;
        }

        .delete-btn:hover {
          background: #fef2f2;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modern-user-profile {
            padding: 16px 12px;
          }
          
          .header-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .action-btn {
            flex: 1;
            justify-content: center;
          }
          
          .address-actions {
            flex-direction: column;
          }
          
          .card-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          
          .form-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
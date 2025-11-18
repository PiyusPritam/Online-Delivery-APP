import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ userInfo, onLogout, currentMode, onModeChange, onBackToLanding }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hasRole = (role) => {
    return userInfo?.roles?.includes(role) || false;
  };

  const getUserDisplayName = () => {
    if (userInfo?.name && userInfo.name !== ' ') {
      return userInfo.name;
    }
    return `${userInfo?.first_name || 'User'} ${userInfo?.last_name || ''}`.trim();
  };

  const getUserInitials = () => {
    if (userInfo?.first_name && userInfo?.last_name) {
      return `${userInfo.first_name.charAt(0)}${userInfo.last_name.charAt(0)}`.toUpperCase();
    } else if (userInfo?.first_name) {
      return userInfo.first_name.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getRoleInfo = () => {
    if (hasRole('x_1599224_online_d.delivery_admin')) {
      return { label: 'Admin', color: '#dc2626', bgColor: '#fee2e2' };
    } else if (hasRole('x_1599224_online_d.store_manager')) {
      return { label: 'Manager', color: '#d97706', bgColor: '#fed7aa' };
    }
    return { label: 'Customer', color: '#2563eb', bgColor: '#dbeafe' };
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const closeUserMenu = () => {
    setShowUserMenu(false);
  };

  const handleModeChange = (mode) => {
    onModeChange(mode);
    closeUserMenu();
  };

  const handleLogout = () => {
    closeUserMenu();
    onLogout();
  };

  const roleInfo = getRoleInfo();

  return (
    <div className={`esc-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="esc-header-container">
        
        {/* Left Section - Brand and Navigation */}
        <div className="esc-header-left">
          {/* Brand */}
          <div className="esc-brand" onClick={onBackToLanding}>
            <div className="esc-brand-icon">
              <span>🚚</span>
            </div>
            <div className="esc-brand-text">
              <span className="esc-brand-name">Quick Delivery</span>
            </div>
          </div>

          {/* Navigation Breadcrumb Style */}
          <div className="esc-nav-breadcrumb">
            <button className="esc-nav-item" onClick={onBackToLanding}>
              <span className="esc-nav-icon">🏠</span>
              <span className="esc-nav-text">Home</span>
            </button>
            
            {currentMode !== 'landing' && (
              <>
                <span className="esc-nav-separator">›</span>
                <button className="esc-nav-item active">
                  <span className="esc-nav-icon">
                    {currentMode === 'customer' ? '🛒' : '🏪'}
                  </span>
                  <span className="esc-nav-text">
                    {currentMode === 'customer' ? 'Shopping' : 'Store Management'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Center Section - Current Mode Status */}
        <div className="esc-header-center">
          <div className="esc-mode-status">
            <span className="esc-status-label">Mode:</span>
            <span className="esc-status-value">
              {currentMode === 'landing' && 'Dashboard'}
              {currentMode === 'customer' && 'Customer Portal'}
              {currentMode === 'store' && 'Store Dashboard'}
            </span>
          </div>
        </div>

        {/* Right Section - Actions and User */}
        <div className="esc-header-right">
          
          {/* Mode Switcher */}
          {hasRole('x_1599224_online_d.store_manager') && (currentMode === 'customer' || currentMode === 'store') && (
            <div className="esc-mode-switcher">
              <button 
                className={`esc-switch-btn ${currentMode === 'customer' ? 'active' : ''}`}
                onClick={() => handleModeChange('customer')}
              >
                <span className="esc-switch-icon">🛒</span>
                <span className="esc-switch-text">Customer</span>
              </button>
              <button 
                className={`esc-switch-btn ${currentMode === 'store' ? 'active' : ''}`}
                onClick={() => handleModeChange('store')}
              >
                <span className="esc-switch-icon">🏪</span>
                <span className="esc-switch-text">Store</span>
              </button>
            </div>
          )}

          {/* User Profile */}
          <div className="esc-user-section">
            <div className="esc-user-profile" onClick={toggleUserMenu}>
              <div className="esc-user-info">
                <span className="esc-user-name">{getUserDisplayName()}</span>
                <span className="esc-user-role" style={{ color: roleInfo.color }}>
                  <span className="esc-role-icon">{roleInfo.label === 'Admin' ? '👑' : roleInfo.label === 'Manager' ? '🏪' : '🛒'}</span>
                  <span className="esc-role-text">{roleInfo.label}</span>
                </span>
              </div>
              
              <div className="esc-user-avatar" style={{ backgroundColor: roleInfo.bgColor, color: roleInfo.color }}>
                <span className="esc-avatar-initials">{getUserInitials()}</span>
              </div>

              <div className={`esc-dropdown-arrow ${showUserMenu ? 'open' : ''}`}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <>
                <div className="esc-menu-backdrop" onClick={closeUserMenu}></div>
                <div className="esc-user-menu">
                  
                  {/* User Profile Header */}
                  <div className="esc-menu-header">
                    <div className="esc-menu-avatar" style={{ backgroundColor: roleInfo.bgColor, color: roleInfo.color }}>
                      <span className="esc-menu-initials">{getUserInitials()}</span>
                    </div>
                    <div className="esc-menu-user-info">
                      <div className="esc-menu-name">{getUserDisplayName()}</div>
                      <div className="esc-menu-email">{userInfo?.email || userInfo?.user_name}</div>
                      <div className="esc-menu-role" style={{ color: roleInfo.color }}>
                        <span>{roleInfo.label === 'Admin' ? '👑' : roleInfo.label === 'Manager' ? '🏪' : '🛒'}</span>
                        <span>{roleInfo.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Options */}
                  <div className="esc-menu-section">
                    <div className="esc-section-title">Navigation</div>
                    
                    <button className="esc-menu-item" onClick={() => { onBackToLanding(); closeUserMenu(); }}>
                      <span className="esc-item-icon">🏠</span>
                      <span className="esc-item-text">Dashboard</span>
                    </button>
                    
                    <button className="esc-menu-item" onClick={() => handleModeChange('customer')}>
                      <span className="esc-item-icon">🛒</span>
                      <span className="esc-item-text">Customer Portal</span>
                    </button>
                    
                    {hasRole('x_1599224_online_d.store_manager') && (
                      <button className="esc-menu-item" onClick={() => handleModeChange('store')}>
                        <span className="esc-item-icon">🏪</span>
                        <span className="esc-item-text">Store Dashboard</span>
                      </button>
                    )}
                  </div>

                  {/* Account Settings */}
                  <div className="esc-menu-section">
                    <div className="esc-section-title">Account</div>
                    
                    <button className="esc-menu-item">
                      <span className="esc-item-icon">👤</span>
                      <span className="esc-item-text">My Profile</span>
                    </button>
                    
                    <button className="esc-menu-item">
                      <span className="esc-item-icon">⚙️</span>
                      <span className="esc-item-text">Settings</span>
                    </button>
                    
                    <button className="esc-menu-item">
                      <span className="esc-item-icon">🔔</span>
                      <span className="esc-item-text">Notifications</span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="esc-menu-section">
                    <button className="esc-menu-item logout" onClick={handleLogout}>
                      <span className="esc-item-icon">🚪</span>
                      <span className="esc-item-text">Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ userInfo, onLogout, currentMode, onModeChange, onBackToLanding }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    const saved = localStorage.getItem('freshcart-dark-mode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Apply dark mode to document
    document.documentElement.classList.toggle('dark-mode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
    
    // Save to localStorage
    localStorage.setItem('freshcart-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const roleInfo = getRoleInfo();

  return (
    <div className={`compact-header ${scrolled ? 'scrolled' : ''} ${darkMode ? 'dark-mode' : ''}`}>
      <div className="compact-header-container">
        
        {/* Brand - Updated to FreshCart */}
        <div className="compact-brand" onClick={onBackToLanding}>
          <span className="brand-icon">🛒</span>
          <span className="brand-text">FreshCart</span>
        </div>

        {/* Navigation - Horizontal */}
        <div className="compact-nav">
          <button 
            className={`nav-btn ${currentMode === 'landing' ? 'active' : ''}`}
            onClick={onBackToLanding}
          >
            <span>🏠</span>
            <span>Home</span>
          </button>
          
          <button 
            className={`nav-btn ${currentMode === 'customer' ? 'active' : ''}`}
            onClick={() => onModeChange('customer')}
          >
            <span>🛒</span>
            <span>Shop</span>
          </button>
          
          {hasRole('x_1599224_online_d.store_manager') && (
            <button 
              className={`nav-btn ${currentMode === 'store' ? 'active' : ''}`}
              onClick={() => onModeChange('store')}
            >
              <span>🏪</span>
              <span>Manage</span>
            </button>
          )}
        </div>

        {/* Controls Section */}
        <div className="header-controls">
          {/* Dark Mode Toggle */}
          <button 
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <svg className="theme-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.5C15.0376 17.5 17.5 15.0376 17.5 12C17.5 8.96244 15.0376 6.5 12 6.5C8.96244 6.5 6.5 8.96244 6.5 12C6.5 15.0376 8.96244 17.5 12 17.5Z"/>
                <path d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V4C12.75 4.41421 12.4142 4.75 12 4.75C11.5858 4.75 11.25 4.41421 11.25 4V2C11.25 1.58579 11.5858 1.25 12 1.25Z"/>
                <path d="M4 12.75C4.41421 12.75 4.75 12.4142 4.75 12C4.75 11.5858 4.41421 11.25 4 11.25H2C1.58579 11.25 1.25 11.5858 1.25 12C1.25 12.4142 1.58579 12.75 2 12.75H4Z"/>
                <path d="M22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H20C19.5858 12.75 19.25 12.4142 19.25 12C19.25 11.5858 19.5858 11.25 20 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12Z"/>
                <path d="M12 22.75C12.4142 22.75 12.75 22.4142 12.75 22V20C12.75 19.5858 12.4142 19.25 12 19.25C11.5858 19.25 11.25 19.5858 11.25 20V22C11.25 22.4142 11.5858 22.75 12 22.75Z"/>
                <path d="M18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L17.2929 8.12132C16.9024 8.51184 16.2692 8.51184 15.8787 8.12132C15.4882 7.73079 15.4882 7.09763 15.8787 6.70711L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289Z"/>
                <path d="M8.12132 15.8787C8.51184 16.2692 8.51184 16.9024 8.12132 17.2929L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L6.70711 15.8787C7.09763 15.4882 7.73079 15.4882 8.12132 15.8787Z"/>
                <path d="M18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L15.8787 17.2929C15.4882 16.9024 15.4882 16.2692 15.8787 15.8787C16.2692 15.4882 16.9024 15.4882 17.2929 15.8787L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071Z"/>
                <path d="M8.12132 8.12132C7.73079 8.51184 7.09763 8.51184 6.70711 8.12132L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L8.12132 6.70711C8.51184 7.09763 8.51184 7.73079 8.12132 8.12132Z"/>
              </svg>
            ) : (
              <svg className="theme-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* User Section - Compact */}
          <div className="compact-user" onClick={toggleUserMenu}>
            <div className="user-avatar" style={{ backgroundColor: roleInfo.bgColor, color: roleInfo.color }}>
              {getUserInitials()}
            </div>
            <div className="user-details">
              <span className="user-name">{getUserDisplayName()}</span>
              <span className="user-role" style={{ color: roleInfo.color }}>
                {roleInfo.label === 'Admin' ? '👑' : roleInfo.label === 'Manager' ? '🏪' : '🛒'} {roleInfo.label}
              </span>
            </div>
            <div className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <>
            <div className="menu-backdrop" onClick={closeUserMenu}></div>
            <div className="user-dropdown">
              
              <div className="dropdown-header">
                <div className="dropdown-avatar" style={{ backgroundColor: roleInfo.bgColor, color: roleInfo.color }}>
                  {getUserInitials()}
                </div>
                <div className="dropdown-info">
                  <div className="dropdown-name">{getUserDisplayName()}</div>
                  <div className="dropdown-email">{userInfo?.email || userInfo?.user_name}</div>
                  <div className="dropdown-role" style={{ color: roleInfo.color }}>
                    {roleInfo.label === 'Admin' ? '👑' : roleInfo.label === 'Manager' ? '🏪' : '🛒'} {roleInfo.label}
                  </div>
                </div>
              </div>

              <div className="dropdown-section">
                <button className="dropdown-item" onClick={() => { onBackToLanding(); closeUserMenu(); }}>
                  <span>🏠</span> Dashboard
                </button>
                
                <button className="dropdown-item" onClick={() => handleModeChange('customer')}>
                  <span>🛒</span> Shopping
                </button>
                
                {hasRole('x_1599224_online_d.store_manager') && (
                  <button className="dropdown-item" onClick={() => handleModeChange('store')}>
                    <span>🏪</span> Store Management
                  </button>
                )}
              </div>

              <div className="dropdown-section">
                <button className="dropdown-item" onClick={toggleDarkMode}>
                  <span>{darkMode ? '☀️' : '🌙'}</span> 
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                
                <button className="dropdown-item">
                  <span>👤</span> Profile Settings
                </button>
                
                <button className="dropdown-item">
                  <span>🔔</span> Notifications
                </button>
                
                <button className="dropdown-item">
                  <span>❓</span> Help & Support
                </button>
              </div>

              <div className="dropdown-section">
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <span>🚪</span> Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
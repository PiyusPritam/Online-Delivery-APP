import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ userInfo, onLogout, currentMode, onModeChange, onBackToLanding, darkMode, onToggleDarkMode }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-section')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

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
      return { 
        label: 'System Admin', 
        icon: '👑', 
        color: '#dc2626',
        bgColor: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
        badge: 'admin'
      };
    } else if (hasRole('x_1599224_online_d.store_manager')) {
      return { 
        label: 'Store Manager', 
        icon: '🏪', 
        color: '#d97706',
        bgColor: 'linear-gradient(135deg, #fffbeb 0%, #fed7aa 100%)',
        badge: 'manager'
      };
    }
    return { 
      label: 'Premium Member', 
      icon: '💎', 
      color: '#2563eb',
      bgColor: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      badge: 'customer'
    };
  };

  const roleInfo = getRoleInfo();

  return (
    <header className={`sleek-header ${scrolled ? 'scrolled' : ''} ${darkMode ? 'dark-mode' : ''}`}>
      <div className="header-container">
        
        {/* Brand Section */}
        <div className="brand-section" onClick={onBackToLanding}>
          <div className="brand-logo">
            <div className="logo-icon">
              <span className="logo-emoji">🛒</span>
              <div className="logo-pulse"></div>
            </div>
            <div className="brand-text">
              <h1 className="brand-name">FreshCart</h1>
              <span className="brand-tagline">Premium Delivery</span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="nav-section">
          <div className="nav-menu">
            <button 
              className={`nav-item ${currentMode === 'landing' ? 'active' : ''}`}
              onClick={onBackToLanding}
            >
              <div className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <span className="nav-label">Home</span>
              <div className="nav-indicator"></div>
            </button>
            
            <button 
              className={`nav-item ${currentMode === 'customer' ? 'active' : ''}`}
              onClick={() => onModeChange('customer')}
            >
              <div className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="8" cy="21" r="1"/>
                  <circle cx="19" cy="21" r="1"/>
                  <path d="m2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
              </div>
              <span className="nav-label">Shop</span>
              <div className="nav-indicator"></div>
            </button>
            
            {hasRole('x_1599224_online_d.store_manager') && (
              <button 
                className={`nav-item ${currentMode === 'store' ? 'active' : ''}`}
                onClick={() => onModeChange('store')}
              >
                <div className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 3h18v18H3zM12 8v8m-4-4h8"/>
                  </svg>
                </div>
                <span className="nav-label">Manage</span>
                <div className="nav-indicator"></div>
              </button>
            )}
          </div>
        </nav>

        {/* Actions Section */}
        <div className="actions-section">
          
          {/* Dark Mode Toggle */}
          <button 
            className="action-button theme-toggle"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="theme-icon-container">
              {darkMode ? (
                <svg className="theme-icon" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg className="theme-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </div>
          </button>

          {/* Notifications */}
          <button className="action-button notifications">
            <div className="notification-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="m13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="notification-badge">3</span>
            </div>
          </button>

          {/* User Section */}
          <div className="user-section" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="user-profile">
              <div className="user-avatar" style={{ background: roleInfo.bgColor }}>
                <span className="avatar-text" style={{ color: roleInfo.color }}>
                  {getUserInitials()}
                </span>
                <div className="avatar-ring"></div>
              </div>
              
              <div className="user-info">
                <div className="user-name">{getUserDisplayName()}</div>
                <div className="user-role">
                  <span className="role-icon">{roleInfo.icon}</span>
                  <span className="role-text">{roleInfo.label}</span>
                </div>
              </div>
              
              <div className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar" style={{ background: roleInfo.bgColor }}>
                    <span style={{ color: roleInfo.color }}>{getUserInitials()}</span>
                  </div>
                  <div className="dropdown-info">
                    <div className="dropdown-name">{getUserDisplayName()}</div>
                    <div className="dropdown-email">{userInfo?.email || userInfo?.user_name}</div>
                    <div className={`dropdown-badge ${roleInfo.badge}`}>
                      <span>{roleInfo.icon}</span>
                      <span>{roleInfo.label}</span>
                    </div>
                  </div>
                </div>

                <div className="dropdown-menu">
                  <div className="menu-section">
                    <div className="section-title">Navigation</div>
                    <button className="menu-item" onClick={() => { onBackToLanding(); setShowUserMenu(false); }}>
                      <div className="menu-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        </svg>
                      </div>
                      <span>Dashboard</span>
                    </button>
                    
                    <button className="menu-item" onClick={() => { onModeChange('customer'); setShowUserMenu(false); }}>
                      <div className="menu-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="8" cy="21" r="1"/>
                          <circle cx="19" cy="21" r="1"/>
                          <path d="m2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                        </svg>
                      </div>
                      <span>Shopping</span>
                    </button>
                    
                    {hasRole('x_1599224_online_d.store_manager') && (
                      <button className="menu-item" onClick={() => { onModeChange('store'); setShowUserMenu(false); }}>
                        <div className="menu-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 3h18v18H3zM12 8v8m-4-4h8"/>
                          </svg>
                        </div>
                        <span>Store Management</span>
                      </button>
                    )}
                  </div>

                  <div className="menu-section">
                    <div className="section-title">Settings</div>
                    <button className="menu-item" onClick={onToggleDarkMode}>
                      <div className="menu-icon">
                        {darkMode ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="5"/>
                            <line x1="12" y1="1" x2="12" y2="3"/>
                            <line x1="12" y1="21" x2="12" y2="23"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                          </svg>
                        )}
                      </div>
                      <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    
                    <button className="menu-item">
                      <div className="menu-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <span>Profile Settings</span>
                    </button>
                    
                    <button className="menu-item">
                      <div className="menu-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        </svg>
                      </div>
                      <span>Notifications</span>
                      <div className="menu-badge">3</div>
                    </button>
                  </div>

                  <div className="menu-section">
                    <div className="section-title">Support</div>
                    <button className="menu-item">
                      <div className="menu-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      </div>
                      <span>Help & Support</span>
                    </button>
                    
                    <button className="menu-item">
                      <div className="menu-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                      </div>
                      <span>Documentation</span>
                    </button>
                  </div>

                  <div className="menu-section logout-section">
                    <button className="menu-item logout" onClick={() => { onLogout(); setShowUserMenu(false); }}>
                      <div className="menu-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16,17 21,12 16,7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                      </div>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
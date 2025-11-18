import React from 'react';
import './Header.css';

export default function Header({ 
  currentUser, 
  currentView, 
  onViewChange, 
  cartItemCount, 
  darkMode, 
  onToggleDarkMode 
}) {
  const userName = typeof currentUser?.name === 'object' 
    ? currentUser.name.display_value 
    : (currentUser?.name || 'User');

  const navItems = [
    { id: 'products', label: 'Products', icon: '🛒' },
    { id: 'cart', label: `Cart (${cartItemCount})`, icon: '🛍️' },
    { id: 'orders', label: 'Past Orders', icon: '📋' },
    { id: 'tracking', label: 'Track Orders', icon: '📍' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="app-logo">🚚 Quick Delivery</h1>
        </div>
        
        <nav className="header-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-right">
          <button
            className="dark-mode-toggle"
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          <div className="user-info">
            <span className="user-greeting">Hello, {userName}!</span>
          </div>
        </div>
      </div>
    </header>
  );
}
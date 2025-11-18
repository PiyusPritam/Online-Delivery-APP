import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import ProductManager from './components/ProductManager.jsx';
import OrderManager from './components/OrderManager.jsx';
import Reports from './components/Reports.jsx';
import './App.css';

export default function StoreOwnerApp({ onBackToMain, integratedMode = true, darkMode }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize the app
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard darkMode={darkMode} />;
      case 'products':
        return <ProductManager darkMode={darkMode} />;
      case 'orders':
        return <OrderManager darkMode={darkMode} />;
      case 'reports':
        return <Reports darkMode={darkMode} />;
      default:
        return <Dashboard darkMode={darkMode} />;
    }
  };

  if (loading) {
    return (
      <div className={`store-loading ${darkMode ? 'dark-mode' : ''}`}>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2 className="loading-title">Loading FreshCart Store...</h2>
          <p className="loading-subtitle">Preparing your management dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`store-app-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Store Dashboard Subheader */}
      <div className="store-subheader">
        <div className="store-subheader-container">
          <div className="store-nav-title">
            <div className="store-icon">🏪</div>
            <div className="store-title-text">
              <span className="title">FreshCart Store</span>
              <span className="subtitle">Management Dashboard</span>
            </div>
          </div>

          <div className="store-nav-tabs">
            {[
              { 
                id: 'dashboard', 
                label: 'Overview', 
                icon: '📊',
                description: 'Analytics & KPIs',
                color: '#10b981'
              },
              { 
                id: 'products', 
                label: 'Products', 
                icon: '📦',
                description: 'Catalog Management', 
                color: '#3b82f6'
              },
              { 
                id: 'orders', 
                label: 'Orders', 
                icon: '🛒',
                description: 'Order Processing',
                color: '#f59e0b'
              },
              { 
                id: 'reports', 
                label: 'Reports', 
                icon: '📈',
                description: 'Business Insights',
                color: '#8b5cf6'
              }
            ].map(item => (
              <button
                key={item.id}
                className={`store-nav-tab ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setCurrentView(item.id)}
                style={{ '--tab-color': item.color }}
              >
                <div className="tab-icon">{item.icon}</div>
                <div className="tab-content">
                  <span className="tab-label">{item.label}</span>
                  <span className="tab-description">{item.description}</span>
                </div>
                <div className="tab-indicator"></div>
              </button>
            ))}
          </div>

          <div className="store-stats-mini">
            <div className="mini-stat">
              <span className="mini-stat-icon">⚡</span>
              <span className="mini-stat-text">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="store-main-content">
        {renderCurrentView()}
      </main>

      <style jsx>{`
        .store-app-container {
          min-height: 100vh;
          background: var(--bg-secondary, #f8fafc);
          transition: all 0.3s ease;
        }

        .dark-mode {
          --bg-primary: #1f2937;
          --bg-secondary: #111827;
          --bg-tertiary: #0f1419;
          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --text-tertiary: #9ca3af;
          --border-light: #374151;
          --border-medium: #4b5563;
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
          --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        .dark-mode .store-app-container {
          background: #111827;
        }

        .store-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .dark-mode .store-loading {
          background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
        }

        .loading-content {
          text-align: center;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 6px solid rgba(255, 255, 255, 0.2);
          border-top: 6px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }

        .loading-title {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .loading-subtitle {
          opacity: 0.9;
          margin: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Store Subheader */
        .store-subheader {
          background: var(--bg-primary, white);
          border-bottom: 1px solid var(--border-light, #e5e7eb);
          box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
          position: sticky;
          top: 56px; /* Below main header */
          z-index: 800;
        }

        .store-subheader-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 72px;
        }

        .store-nav-title {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .store-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .store-title-text {
          display: flex;
          flex-direction: column;
        }

        .title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary, #1f2937);
          line-height: 1.2;
        }

        .subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary, #6b7280);
          font-weight: 500;
          line-height: 1.2;
        }

        .store-nav-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          justify-content: center;
          max-width: 800px;
        }

        .store-nav-tab {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: transparent;
          border: 2px solid transparent;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary, #6b7280);
          white-space: nowrap;
          min-width: 140px;
        }

        .store-nav-tab:hover {
          background: var(--bg-secondary, #f8fafc);
          color: var(--text-primary, #1f2937);
          border-color: var(--border-light, #e5e7eb);
        }

        .store-nav-tab.active {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
          color: var(--tab-color);
          border-color: var(--tab-color);
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .tab-icon {
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }

        .store-nav-tab.active .tab-icon {
          transform: scale(1.1);
        }

        .tab-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .tab-label {
          font-size: 1rem;
          line-height: 1.2;
          margin-bottom: 2px;
        }

        .tab-description {
          font-size: 0.75rem;
          opacity: 0.8;
          line-height: 1.2;
        }

        .tab-indicator {
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          background: var(--tab-color);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .store-nav-tab.active .tab-indicator {
          width: 80%;
        }

        .store-stats-mini {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .mini-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .dark-mode .mini-stat {
          background: rgba(52, 211, 153, 0.1);
          color: #34d399;
        }

        .mini-stat-icon {
          font-size: 1rem;
        }

        /* Main Content */
        .store-main-content {
          background: var(--bg-secondary, #f8fafc);
          min-height: calc(100vh - 128px); /* Account for main header + subheader */
          padding: 24px;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .store-subheader-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            padding: 16px 20px;
            min-height: auto;
          }
          
          .store-nav-tabs {
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
            gap: 6px;
          }
          
          .store-nav-tab {
            flex: 1;
            min-width: 120px;
            justify-content: center;
          }
          
          .tab-content {
            align-items: center;
          }
        }

        @media (max-width: 768px) {
          .store-subheader-container {
            padding: 12px 16px;
          }
          
          .store-nav-tabs {
            gap: 4px;
          }
          
          .store-nav-tab {
            padding: 10px 12px;
            min-width: 100px;
            font-size: 13px;
          }
          
          .tab-icon {
            font-size: 1.25rem;
          }
          
          .tab-description {
            display: none; /* Hide descriptions on mobile */
          }
          
          .store-main-content {
            padding: 16px 12px;
          }
        }

        @media (max-width: 480px) {
          .store-nav-title .store-title-text .title {
            font-size: 1rem;
          }
          
          .store-nav-title .store-title-text .subtitle {
            display: none;
          }
          
          .store-nav-tab {
            padding: 8px 10px;
            min-width: 80px;
            font-size: 12px;
          }
          
          .tab-label {
            display: none; /* Show only icons on very small screens */
          }
          
          .store-stats-mini {
            display: none; /* Hide mini stats on mobile */
          }
        }
      `}</style>
    </div>
  );
}
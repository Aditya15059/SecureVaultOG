import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Lock, Unlock, Image, ShieldAlert, Folder, Settings, LogOut } from 'lucide-react';

const DashboardLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Encrypt Message', path: '/encrypt', icon: <Lock size={20} /> },
    { name: 'Decrypt Message', path: '/decrypt', icon: <Unlock size={20} /> },
    { name: 'Hide in Image', path: '/steganography', icon: <Image size={20} /> },
    { name: 'Detect Stego (AI)', path: '/detection', icon: <ShieldAlert size={20} /> },
    { name: 'My Files', path: '/files', icon: <Folder size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside className="glass-panel" style={{ width: '260px', margin: '16px', display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-bg-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <div style={{ background: 'var(--color-primary)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px var(--color-primary-dim)' }}>
            <Lock size={18} color="#000" />
          </div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}><span className="text-neon">Secure</span>Vault</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '0.875rem 1rem', 
                  borderRadius: '8px',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-dim)',
                  backgroundColor: isActive ? 'var(--color-primary-dim)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  border: isActive ? '1px solid rgba(57, 255, 20, 0.2)' : '1px solid transparent'
                }}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-bg-border)' }}>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', color: 'var(--color-danger)', fontWeight: 500, opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}>
            <LogOut size={20} />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '16px 16px 16px 0', overflowY: 'auto', height: '100vh' }}>
        <div className="glass-panel" style={{ height: '100%', borderRadius: '16px', overflowY: 'auto', position: 'relative', border: '1px solid var(--color-bg-border)' }}>
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

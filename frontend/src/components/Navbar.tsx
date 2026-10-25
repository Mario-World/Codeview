import React from 'react';
import { ShieldCheck, HelpCircle, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav style={{
      height: 52,
      background: 'var(--bg-nav)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    }}>
      {/* Brand & Main Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <ShieldCheck size={18} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Ship<span style={{ color: 'var(--color-success)' }}>Safe</span>
          </span>
        </div>

        {/* Top Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            padding: '6px 12px',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            Dashboard
          </button>

          <button style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            PR Reviews
          </button>

          <button style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            padding: '6px 12px',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            Projects
          </button>

          <button style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            padding: '6px 12px',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            Settings
          </button>
        </div>
      </div>

      {/* Right Controls: Help, Notifications & Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex' }} title="Documentation">
          <HelpCircle size={18} />
        </button>

        <div style={{ position: 'relative', display: 'flex', cursor: 'pointer' }} title="Notifications">
          <Bell size={18} color="var(--text-dim)" />
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--color-danger)'
          }} />
        </div>

        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#ffffff',
          cursor: 'pointer'
        }}>
          S
        </div>
      </div>
    </nav>
  );
};

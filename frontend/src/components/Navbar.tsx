import React from 'react';
import { ShieldCheck, GitPullRequest, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import { ScenarioSummary } from '../types';

interface NavbarProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  onOpenCustomModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onOpenCustomModal,
}) => {
  return (
    <header style={{
      background: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        {/* Logo and Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
          }}>
            <ShieldCheck size={26} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                Ship<span style={{ color: '#10b981' }}>Safe</span>
              </span>
              <span style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '2px 8px',
                borderRadius: 9999,
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                v1.0 Ready
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              AI Code Review for Production Readiness · Proves Every Fix
            </p>
          </div>
        </div>

        {/* Demo Scenarios Quick Pickers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 }}>
            Demo PRs:
          </span>

          {scenarios.map((s) => {
            const isActive = s.id === activeScenarioId;
            let icon = <AlertTriangle size={14} color="#f43f5e" />;
            if (s.id === 'logic_discount') icon = <AlertTriangle size={14} color="#f97316" />;
            if (s.id === 'clean_pr') icon = <CheckCircle2 size={14} color="#10b981" />;

            return (
              <button
                key={s.id}
                onClick={() => onSelectScenario(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive 
                    ? '1px solid #6366f1' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isActive 
                    ? 'rgba(99, 102, 241, 0.2)' 
                    : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none',
                }}
              >
                {icon}
                <span>{s.id === 'auth_idor' ? 'Auth IDOR' : s.id === 'logic_discount' ? 'Pricing Logic' : s.id === 'sql_injection' ? 'SQL Injection' : 'Clean PR'}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>#{s.pr_number}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenCustomModal}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <GitPullRequest size={14} />
            <span>Custom PR / Diff</span>
          </button>
        </div>
      </div>
    </header>
  );
};

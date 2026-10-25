import React from 'react';
import { ShieldCheck, GitPullRequest, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
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
    <nav style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 20px',
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: 'var(--color-success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <ShieldCheck size={18} strokeWidth={2.5} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Ship<span style={{ color: 'var(--color-success)' }}>Safe</span>
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 500 }}>
            AI PR Reviewer
          </span>
        </div>
      </div>

      {/* Clean Scenario Selector Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 6,
        padding: 2,
        border: '1px solid var(--border-subtle)'
      }}>
        {scenarios.map((s) => {
          const isActive = s.id === activeScenarioId;
          const label = s.id === 'auth_idor' ? 'Auth IDOR' : s.id === 'logic_discount' ? 'Pricing Logic' : s.id === 'sql_injection' ? 'SQL Injection' : 'Clean PR';
          return (
            <button
              key={s.id}
              onClick={() => onSelectScenario(s.id)}
              style={{
                border: 'none',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                padding: '5px 12px',
                borderRadius: 4,
                fontSize: '0.78rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{label}</span>
              <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>#{s.pr_number}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenCustomModal}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--text-dim)',
            padding: '5px 10px',
            borderRadius: 4,
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
          title="Analyze Custom PR"
        >
          <GitPullRequest size={12} />
          <span>+ Custom</span>
        </button>
      </div>

      {/* Principles Link / Clean Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Prove Fixes Before Shipping
        </span>
      </div>
    </nav>
  );
};

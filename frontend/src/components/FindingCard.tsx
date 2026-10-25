import React from 'react';
import { AlertCircle, Flame, Target, Sparkles, UserCheck, CheckCircle2 } from 'lucide-react';
import { ScenarioDetail } from '../types';

interface FindingCardProps {
  scenario: ScenarioDetail;
}

export const FindingCard: React.FC<FindingCardProps> = ({ scenario }) => {
  const isClean = scenario.id === 'clean_pr';

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 }}>
          {isClean ? <CheckCircle2 size={20} color="#10b981" /> : <AlertCircle size={20} color="#f43f5e" />}
          {isClean ? 'Clean Review Verdict' : 'Actionable Defect Investigation'}
        </h2>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Confidence Grounding: <strong style={{ color: '#a5b4fc' }}>{scenario.confidence}%</strong> (Lines {scenario.file_path}#L{scenario.id === 'auth_idor' ? '23-35' : scenario.id === 'logic_discount' ? '18-32' : '1-35'})
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isClean ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Defect Summary / Finding Description */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 8,
          padding: 16
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Target size={14} color="#6366f1" />
            <span>Finding Summary</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.6 }}>
            {scenario.summary}
          </p>
        </div>

        {/* Impact & Blast Radius */}
        {!isClean && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.04)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            borderRadius: 8,
            padding: 16
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={14} color="#f43f5e" />
              <span>Production Blast Radius & Impact</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#fecdd3', lineHeight: 1.6 }}>
              {scenario.impact}
            </p>
          </div>
        )}
      </div>

      {/* Root Cause & Fix Approach */}
      {!isClean && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.04)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 20
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} color="#818cf8" />
            <span>Root Cause & Verified Fix Strategy</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: 8 }}>
            <strong>Root Cause:</strong> {scenario.root_cause}
          </p>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            <strong>Minimal Patch:</strong> {scenario.proposed_fix_summary}
          </p>
        </div>
      )}

      {/* Human in the loop guidance */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 8,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        fontSize: '0.8rem',
        color: '#94a3b8'
      }}>
        <UserCheck size={16} color="#10b981" />
        <span>
          <strong style={{ color: '#f1f5f9' }}>ShipSafe Principle:</strong> AI proposes the fix; sandbox tools and pytest prove the evidence; the developer retains full merge control.
        </span>
      </div>
    </div>
  );
};

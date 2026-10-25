import React, { useState } from 'react';
import { X, GitPullRequest, Code, ArrowRight, AlertCircle } from 'lucide-react';

interface CustomPRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitURL: (url: string) => void;
  onSubmitCustomCode: (code: string) => void;
  isLoading: boolean;
}

export const CustomPRModal: React.FC<CustomPRModalProps> = ({
  isOpen,
  onClose,
  onSubmitURL,
  onSubmitCustomCode,
  isLoading,
}) => {
  const [tab, setTab] = useState<'url' | 'code'>('url');
  const [prUrl, setPrUrl] = useState('');
  const [customCode, setCustomCode] = useState(`def transfer_funds(sender_id: str, recipient_id: str, amount: float):\n    # Simulated AI generated payment transfer\n    sender = get_account(sender_id)\n    recipient = get_account(recipient_id)\n    \n    # Vulnerability: No balance check or transaction lock\n    sender.balance -= amount\n    recipient.balance += amount\n    return {"status": "success", "amount": amount}`);

  if (!isOpen) return null;

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prUrl.trim()) return;
    onSubmitURL(prUrl.trim());
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCode.trim()) return;
    onSubmitCustomCode(customCode.trim());
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 20
    }}>
      <div className="glass-panel" style={{
        maxWidth: 620,
        width: '100%',
        padding: 24,
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <GitPullRequest size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                Analyze Pull Request or Diff
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                ShipSafe will inspect changed files, check evidence, and formulate a verified patch
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: 6, borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 10 }}>
          <button
            onClick={() => setTab('url')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: '0.82rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'url' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: tab === 'url' ? '#ffffff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <GitPullRequest size={14} />
            <span>GitHub PR URL</span>
          </button>

          <button
            onClick={() => setTab('code')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: '0.82rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: tab === 'code' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: tab === 'code' ? '#ffffff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Code size={14} />
            <span>Paste Code / Diff</span>
          </button>
        </div>

        {tab === 'url' ? (
          <form onSubmit={handleUrlSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
                Public GitHub Pull Request URL:
              </label>
              <input
                type="url"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                placeholder="https://github.com/owner/repository/pull/123"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem', color: '#64748b' }}>
                <AlertCircle size={13} />
                <span>Example: https://github.com/acme-corp/billing-service/pull/142</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isLoading || !prUrl.trim()} className="btn btn-primary">
                {isLoading ? 'Fetching PR...' : 'Inspect & Analyze PR'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
                Paste Changed Python Code or Diff:
              </label>
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                rows={9}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#090c13',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#e2e8f0',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  lineHeight: 1.5,
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isLoading || !customCode.trim()} className="btn btn-primary">
                {isLoading ? 'Analyzing...' : 'Analyze Code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

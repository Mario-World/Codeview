import React from 'react';
import { Terminal, CheckCircle2, XCircle, Clock, ShieldCheck, Zap, RefreshCw, Cpu, Check, AlertTriangle } from 'lucide-react';
import { VerifyResponse, ScenarioDetail } from '../types';

interface SandboxConsoleProps {
  scenario: ScenarioDetail;
  verifyResponse: VerifyResponse | null;
  isVerifying: boolean;
  onTriggerVerify: () => void;
}

export const SandboxConsole: React.FC<SandboxConsoleProps> = ({
  scenario,
  verifyResponse,
  isVerifying,
  onTriggerVerify,
}) => {
  const isClean = scenario.id === 'clean_pr';

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: 24 }}>
      {/* Console Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <Terminal size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                Isolated Sandbox Verification Engine
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Ephemeral Worktree · Real Pytest Execution · Zero Production Secrets Exposure
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onTriggerVerify}
            disabled={isVerifying}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            {isVerifying ? (
              <>
                <RefreshCw size={14} className="anim-spin" />
                <span>Running Isolated Pytest...</span>
              </>
            ) : (
              <>
                <Zap size={14} />
                <span>Execute Sandbox Verification</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* When verifying: Animated Execution Telemetry */}
      {isVerifying && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div className="anim-spin" style={{ width: 14, height: 14, border: '2px solid #818cf8', borderTopColor: 'transparent', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818cf8' }}>
              Execution Sandbox Active: Reproducing defect & evaluating patch...
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            $ python -m pytest {scenario.test_file} -v --tb=short (in /tmp/shipsafe_sandbox_5f8a)
          </div>
        </div>
      )}

      {/* Verification Results Display */}
      {verifyResponse ? (
        <div>
          {/* Verdict Banner */}
          <div style={{
            padding: '12px 18px',
            borderRadius: 8,
            background: verifyResponse.is_verified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
            border: `1px solid ${verifyResponse.is_verified ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {verifyResponse.is_verified ? (
                <ShieldCheck size={22} color="#10b981" />
              ) : (
                <XCircle size={22} color="#f43f5e" />
              )}
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: verifyResponse.is_verified ? '#10b981' : '#f43f5e' }}>
                  {verifyResponse.is_verified ? 'VERIFICATION PROVED: Defect reproduced on original, resolved on candidate patch' : 'VERIFICATION INCOMPLETE: Patch did not satisfy tests'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  {verifyResponse.explanation}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
              <span style={{ color: '#94a3b8' }}>Total execution time:</span>
              <strong style={{ color: '#ffffff' }}>
                {(verifyResponse.original_result.execution_time_ms + verifyResponse.patched_result.execution_time_ms).toFixed(1)}ms
              </strong>
            </div>
          </div>

          {/* Dual Terminal Output */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Terminal 1: Original Code Run */}
            <div className="terminal-window">
              <div className="terminal-header" style={{ borderLeft: `3px solid ${verifyResponse.original_result.passed ? '#10b981' : '#f43f5e'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="terminal-dots">
                    <span className="terminal-dot dot-red" />
                    <span className="terminal-dot dot-yellow" />
                    <span className="terminal-dot dot-green" />
                  </div>
                  <span style={{ fontWeight: 700, color: verifyResponse.original_result.passed ? '#10b981' : '#f43f5e' }}>
                    STEP 1: Test Against Original PR Code
                  </span>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                  {verifyResponse.original_result.execution_time_ms}ms · Exit {verifyResponse.original_result.exit_code}
                </span>
              </div>
              <div className="terminal-body" style={{ color: verifyResponse.original_result.passed ? '#86efac' : '#fca5a5' }}>
                {verifyResponse.original_result.stdout || verifyResponse.original_result.stderr}
                {verifyResponse.original_result.failure_details && (
                  <div style={{ marginTop: 8, padding: 8, background: 'rgba(244, 63, 94, 0.15)', borderRadius: 4, color: '#fecdd3', fontWeight: 600 }}>
                    ❌ REPRODUCED DEFECT: {verifyResponse.original_result.failure_details}
                  </div>
                )}
              </div>
            </div>

            {/* Terminal 2: Patched Code Run */}
            <div className="terminal-window">
              <div className="terminal-header" style={{ borderLeft: `3px solid ${verifyResponse.patched_result.passed ? '#10b981' : '#f43f5e'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="terminal-dots">
                    <span className="terminal-dot dot-red" />
                    <span className="terminal-dot dot-yellow" />
                    <span className="terminal-dot dot-green" />
                  </div>
                  <span style={{ fontWeight: 700, color: verifyResponse.patched_result.passed ? '#10b981' : '#f43f5e' }}>
                    STEP 2: Test Against Patched Code Candidate
                  </span>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                  {verifyResponse.patched_result.execution_time_ms}ms · Exit {verifyResponse.patched_result.exit_code}
                </span>
              </div>
              <div className="terminal-body" style={{ color: verifyResponse.patched_result.passed ? '#86efac' : '#fca5a5' }}>
                {verifyResponse.patched_result.stdout || verifyResponse.patched_result.stderr}
                {verifyResponse.patched_result.passed && (
                  <div style={{ marginTop: 8, padding: 8, background: 'rgba(16, 185, 129, 0.15)', borderRadius: 4, color: '#a7f3d0', fontWeight: 600 }}>
                    ✅ 100% PASS: All regression and security assertions satisfied!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Initial State */
        <div style={{
          padding: '36px 20px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: 8
        }}>
          <Cpu size={32} color="#6366f1" style={{ marginBottom: 12, opacity: 0.8 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
            Ready to Run Deterministic Sandbox Verification
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: 520, margin: '0 auto 16px' }}>
            Click "Execute Sandbox Verification" above to launch an ephemeral container worktree. ShipSafe will execute the targeted test against the original PR (proving failure) and then against the proposed fix (proving resolution).
          </p>
          <button onClick={onTriggerVerify} className="btn btn-primary" style={{ padding: '8px 18px' }}>
            <Zap size={14} />
            <span>Run Targeted Pytest Sandbox</span>
          </button>
        </div>
      )}
    </div>
  );
};

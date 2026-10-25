import React from 'react';
import { GitPullRequest, ShieldAlert, ShieldCheck, CheckCircle2, AlertOctagon, Cpu, Zap, Activity } from 'lucide-react';
import { ScenarioDetail, VerifyResponse } from '../types';

interface ReadinessHeaderProps {
  scenario: ScenarioDetail;
  verifyResponse: VerifyResponse | null;
  onTriggerVerify: () => void;
  isVerifying: boolean;
}

export const ReadinessHeader: React.FC<ReadinessHeaderProps> = ({
  scenario,
  verifyResponse,
  onTriggerVerify,
  isVerifying,
}) => {
  const isClean = scenario.id === 'clean_pr';
  const isVerified = verifyResponse?.is_verified && !isClean;

  // Status configuration
  let bannerBg = 'rgba(244, 63, 94, 0.1)';
  let bannerBorder = 'rgba(244, 63, 94, 0.35)';
  let statusText = 'BLOCKED FROM PRODUCTION';
  let statusSubtext = '1 Actionable Defect Detected · Fix & Verification Required';
  let StatusIcon = ShieldAlert;
  let statusColor = '#f43f5e';

  if (isClean) {
    bannerBg = 'rgba(16, 185, 129, 0.1)';
    bannerBorder = 'rgba(16, 185, 129, 0.35)';
    statusText = 'PRODUCTION READINESS: CERTIFIED APPROVED';
    statusSubtext = 'Restraint Verified: 0 Defects Detected · Clean PR passing all regression suites';
    StatusIcon = ShieldCheck;
    statusColor = '#10b981';
  } else if (isVerified) {
    bannerBg = 'rgba(16, 185, 129, 0.12)';
    bannerBorder = 'rgba(16, 185, 129, 0.45)';
    statusText = 'VERIFIED FIX READY FOR PRODUCTION';
    statusSubtext = 'Minimal patch tested & verified in isolated sandbox (Targeted pytest passed)';
    StatusIcon = CheckCircle2;
    statusColor = '#10b981';
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 250,
        height: 250,
        borderRadius: '50%',
        background: statusColor,
        filter: 'blur(100px)',
        opacity: 0.12,
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        {/* Left: PR Metadata */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.8rem',
              color: '#818cf8',
              fontWeight: 600,
              background: 'rgba(99, 102, 241, 0.12)',
              padding: '2px 8px',
              borderRadius: 6
            }}>
              <GitPullRequest size={13} />
              {scenario.repo_name}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>PR #{scenario.pr_number}</span>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>·</span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Author: <strong style={{ color: '#cbd5e1' }}>{scenario.pr_author}</strong></span>
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: 12 }}>
            {scenario.pr_title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className={`badge ${scenario.severity === 'CRITICAL' ? 'badge-critical' : scenario.severity === 'HIGH' ? 'badge-high' : 'badge-verified'}`}>
              Severity: {scenario.severity}
            </span>
            <span className="badge badge-neutral">
              Category: {scenario.category}
            </span>
            <span className="badge badge-neutral" style={{ color: '#a5b4fc', border: '1px solid rgba(165, 180, 252, 0.3)' }}>
              Confidence: {scenario.confidence}%
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              File: <code style={{ color: '#e2e8f0', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>{scenario.file_path}</code>
            </span>
          </div>
        </div>

        {/* Right: Verification Action & Quick Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          {!isClean && (
            <button
              onClick={onTriggerVerify}
              disabled={isVerifying}
              className={isVerified ? "btn btn-success" : "btn btn-primary"}
              style={{ padding: '10px 20px', fontSize: '0.9rem', fontWeight: 700 }}
            >
              {isVerifying ? (
                <>
                  <div className="anim-spin" style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  <span>Executing Isolated Sandbox Test...</span>
                </>
              ) : isVerified ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Re-Run Sandbox Verification</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span>Verify Patch in Sandbox</span>
                </>
              )}
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748b' }}>
            <Cpu size={14} />
            <span>Isolated Temp Worktree · No Prod Secrets</span>
          </div>
        </div>
      </div>

      {/* Production Readiness Status Callout */}
      <div style={{
        marginTop: 20,
        padding: '14px 18px',
        borderRadius: 10,
        background: bannerBg,
        border: `1px solid ${bannerBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ color: statusColor, display: 'flex' }}>
            <StatusIcon size={24} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: statusColor, letterSpacing: '0.02em' }}>
              {statusText}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              {statusSubtext}
            </div>
          </div>
        </div>

        {/* Evidence outcome pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: 6,
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ color: '#94a3b8' }}>Original Test:</span>
            <span style={{ color: isClean ? '#10b981' : '#f43f5e', fontWeight: 700 }}>
              {isClean ? 'PASS (0 Defect)' : (verifyResponse ? 'FAIL (Reproduced)' : 'FAIL')}
            </span>
          </div>

          <div style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: 6,
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ color: '#94a3b8' }}>Patched Test:</span>
            <span style={{ color: isVerified || isClean ? '#10b981' : '#f97316', fontWeight: 700 }}>
              {isClean ? 'PASS' : (isVerified ? 'PASS (Verified)' : 'PENDING RUN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

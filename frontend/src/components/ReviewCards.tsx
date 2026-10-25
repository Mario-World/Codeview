import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  MoreHorizontal, 
  Terminal, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  FileText,
  Flame,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { ScenarioDetail, VerifyResponse } from '../types';

interface ReviewCardsProps {
  scenario: ScenarioDetail;
  verifyResponse: VerifyResponse | null;
  isVerifying: boolean;
  onVerify: () => void;
  onOpenReport: () => void;
}

export const ReviewCards: React.FC<ReviewCardsProps> = ({
  scenario,
  verifyResponse,
  isVerifying,
  onVerify,
  onOpenReport,
}) => {
  const isClean = scenario.id === 'clean_pr';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', overflowY: 'auto' }}>
      {/* CARD 1: Defect Finding Card with Framer Motion */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="panel-card"
        style={{ padding: 18 }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: isClean ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
              color: isClean ? 'var(--color-success)' : 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              {isClean ? '✓' : '!'}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
              {isClean ? 'Clean PR Review' : 'Defect Finding'}
            </span>
          </div>

          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Finding Title */}
        <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.4, marginBottom: 10 }}>
          {scenario.title}
        </h2>

        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className={`badge-pill ${isClean ? 'badge-success' : 'badge-critical'}`}>
            {isClean ? 'CLEAN & SAFE' : `${scenario.severity} DEFECT`}
          </span>
          <span className="badge-pill badge-dark">
            {scenario.category}
          </span>
          <span className="badge-pill badge-dark">
            {scenario.language === 'typescript' ? 'TypeScript' : 'Python'}
          </span>
        </div>

        {/* Defect Metadata */}
        <div style={{
          fontSize: '0.72rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          paddingBottom: 10,
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 12
        }}>
          Defect ID: {scenario.id.toUpperCase()}-01 | Conf: <strong style={{ color: '#ffffff' }}>{scenario.confidence}%</strong> | File: {scenario.file_path}
        </div>

        {/* Impact Analysis */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Flame size={13} color="var(--color-danger)" />
            <span>Impact Analysis</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: isClean ? '#a7f3d0' : '#cbd5e1', lineHeight: 1.5 }}>
            {scenario.impact}
          </p>
        </div>
      </motion.div>

      {/* CARD 2: Isolated Sandbox Test Runner with Framer Motion */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="panel-card"
        style={{ padding: 18, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={16} color="var(--accent)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
              Isolated Sandbox Test Runner
            </span>
          </div>

          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Test Command */}
        <div style={{
          fontSize: '0.72rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-dim)',
          marginBottom: 12
        }}>
          &gt; $ {scenario.language === 'typescript' ? 'node' : 'pytest'} {scenario.test_file}
        </div>

        {/* Test Runs Content */}
        {verifyResponse ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flexGrow: 1 }}>
            {/* TEST RUN 1: BEFORE */}
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ borderLeft: `3px solid ${verifyResponse.original_result.passed ? 'var(--color-success)' : 'var(--color-danger)'}`, paddingLeft: 10 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: verifyResponse.original_result.passed ? 'var(--color-success)' : 'var(--color-danger)', letterSpacing: '0.04em' }}>
                  TEST RUN 1: BEFORE PATCH
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {verifyResponse.original_result.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              {/* Animated Progress bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.4 }}
                className={`test-bar ${verifyResponse.original_result.passed ? 'test-bar-green' : 'test-bar-red'}`}
                style={{ marginBottom: 6 }}
              />

              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: verifyResponse.original_result.passed ? '#a7f3d0' : '#fca5a5', lineHeight: 1.4 }}>
                <div>Failure: {scenario.test_file} (FAILED)</div>
                <div>{verifyResponse.original_result.failure_details || 'AssertionError: Pre-patch checks failed'}</div>
                <div style={{ color: 'var(--text-dim)', marginTop: 2 }}>[FAILED] {scenario.file_path}</div>
              </div>
            </motion.div>

            {/* TEST RUN 2: AFTER */}
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={{ borderLeft: `3px solid ${verifyResponse.patched_result.passed ? 'var(--color-success)' : 'var(--color-danger)'}`, paddingLeft: 10 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-success)', letterSpacing: '0.04em' }}>
                  TEST RUN 2: AFTER PATCH
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 600 }}>
                  passed
                </span>
              </div>

              {/* Animated Progress bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="test-bar test-bar-green"
                style={{ marginBottom: 6 }}
              />

              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#86efac', lineHeight: 1.4 }}>
                <div>SUCCESS: {scenario.test_file} (PASSED)</div>
                <div style={{ color: 'var(--color-success)' }}>{verifyResponse.patched_result.summary}</div>
                <div style={{ color: 'var(--text-dim)', marginTop: 2 }}>[OK] {scenario.file_path} ({verifyResponse.patched_result.execution_time_ms}ms)</div>
              </div>
            </motion.div>

            {/* Report Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenReport}
              className="btn btn-outline"
              style={{
                width: '100%',
                marginTop: 6,
                padding: '8px 12px',
                fontSize: '0.75rem',
                gap: 6,
                background: 'rgba(99, 102, 241, 0.08)',
                borderColor: 'var(--border-accent)'
              }}
            >
              <FileText size={13} color="var(--accent)" />
              <span>View Verification Report (Passed / Failed / Uncertain)</span>
            </motion.button>
          </div>
        ) : (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px 10px' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 14 }}>
              Execute targeted tests in an isolated ephemeral sandbox to reproduce the defect and verify the proposed patch.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onVerify}
              disabled={isVerifying}
              className="btn btn-primary"
              style={{ fontSize: '0.78rem' }}
            >
              {isVerifying ? (
                <>
                  <RefreshCw size={13} className="anim-spin" />
                  <span>Executing sandbox tests...</span>
                </>
              ) : (
                <>
                  <Zap size={13} />
                  <span>Execute Sandbox Verification</span>
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* Footer info */}
        {verifyResponse && (
          <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              Ephemeral Container · Exit 0
            </span>
            <button onClick={onVerify} disabled={isVerifying} className="btn btn-outline" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
              <RefreshCw size={11} className={isVerifying ? 'anim-spin' : ''} />
              <span>Re-run</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

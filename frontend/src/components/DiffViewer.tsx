import React, { useState } from 'react';
import { Columns, FileCode, Check, Copy, TestTube } from 'lucide-react';
import { ScenarioDetail } from '../types';

interface DiffViewerProps {
  scenario: ScenarioDetail;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ scenario }) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified' | 'test'>('split');
  const [copied, setCopied] = useState(false);

  const handleCopyPatch = () => {
    navigator.clipboard.writeText(scenario.diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const origLines = scenario.original_code.split('\n');
  const fixedLines = scenario.fixed_code.split('\n');
  const diffLines = scenario.diff.split('\n');
  const testLines = scenario.test_code.split('\n');

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Diff Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileCode size={15} color="var(--accent)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {scenario.file_path}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* View Toggles */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: 2, borderRadius: 4 }}>
            <button
              onClick={() => setViewMode('split')}
              style={{
                border: 'none',
                background: viewMode === 'split' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: viewMode === 'split' ? '#ffffff' : 'var(--text-dim)',
                padding: '3px 8px',
                borderRadius: 3,
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Columns size={12} />
              <span>Split</span>
            </button>

            <button
              onClick={() => setViewMode('unified')}
              style={{
                border: 'none',
                background: viewMode === 'unified' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: viewMode === 'unified' ? '#ffffff' : 'var(--text-dim)',
                padding: '3px 8px',
                borderRadius: 3,
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <FileCode size={12} />
              <span>Unified</span>
            </button>

            <button
              onClick={() => setViewMode('test')}
              style={{
                border: 'none',
                background: viewMode === 'test' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: viewMode === 'test' ? '#ffffff' : 'var(--text-dim)',
                padding: '3px 8px',
                borderRadius: 3,
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <TestTube size={12} />
              <span>Pytest File</span>
            </button>
          </div>

          <button
            onClick={handleCopyPatch}
            className="btn btn-outline"
            style={{ padding: '3px 8px', fontSize: '0.72rem' }}
          >
            {copied ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Patch'}</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 210px)' }}>
        {viewMode === 'split' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%', minHeight: 460 }}>
            {/* Original Left Pane */}
            <div style={{ borderRight: '1px solid var(--border-subtle)', background: '#070a12', overflowX: 'auto' }}>
              <div style={{ padding: '6px 12px', background: 'rgba(244, 63, 94, 0.08)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-danger)' }}>
                ORIGINAL (Buggy Code in PR)
              </div>
              <div className="diff-container" style={{ border: 'none', borderRadius: 0 }}>
                {origLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isBuggy = (scenario.id === 'auth_idor' && lineNum >= 25 && lineNum <= 34) ||
                                  (scenario.id === 'logic_discount' && lineNum >= 22 && lineNum <= 29) ||
                                  (scenario.id === 'sql_injection' && lineNum >= 27 && lineNum <= 32);
                  return (
                    <div key={idx} className={`diff-row ${isBuggy ? 'diff-del' : ''}`}>
                      <span className="diff-num">{lineNum}</span>
                      <span className="diff-text">{line}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Patched Right Pane */}
            <div style={{ background: '#070a12', overflowX: 'auto' }}>
              <div style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.08)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-success)' }}>
                PROPOSED FIX (Minimal Verified Patch)
              </div>
              <div className="diff-container" style={{ border: 'none', borderRadius: 0 }}>
                {fixedLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isFixed = (scenario.id === 'auth_idor' && lineNum >= 25 && lineNum <= 36) ||
                                  (scenario.id === 'logic_discount' && lineNum >= 22 && lineNum <= 32) ||
                                  (scenario.id === 'sql_injection' && lineNum >= 27 && lineNum <= 33);
                  return (
                    <div key={idx} className={`diff-row ${isFixed ? 'diff-add' : ''}`}>
                      <span className="diff-num">{lineNum}</span>
                      <span className="diff-text">{line}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'unified' && (
          <div className="diff-container" style={{ border: 'none', borderRadius: 0, padding: 8 }}>
            {diffLines.map((line, idx) => {
              const isAdd = line.startsWith('+') && !line.startsWith('+++');
              const isDel = line.startsWith('-') && !line.startsWith('---');
              return (
                <div key={idx} className={`diff-row ${isAdd ? 'diff-add' : isDel ? 'diff-del' : ''}`}>
                  <span className="diff-num">{idx + 1}</span>
                  <span className="diff-text">{line}</span>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'test' && (
          <div className="diff-container" style={{ border: 'none', borderRadius: 0, padding: 8 }}>
            <div style={{ padding: '6px 10px', color: 'var(--text-dim)', fontSize: '0.72rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: 6 }}>
              Targeted Sandbox Test: <code>{scenario.test_file}</code>
            </div>
            {testLines.map((line, idx) => (
              <div key={idx} className="diff-row">
                <span className="diff-num">{idx + 1}</span>
                <span className="diff-text" style={{ color: '#cbd5e1' }}>{line}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

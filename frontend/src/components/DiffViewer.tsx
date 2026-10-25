import React, { useState } from 'react';
import { Columns, FileCode, Check, Copy, Maximize2, Code, TestTube } from 'lucide-react';
import { ScenarioDetail } from '../types';
import { highlightPython } from '../utils/syntaxHighlight';

interface DiffViewerProps {
  scenario: ScenarioDetail;
  onCopyPatch: () => void;
  copiedPatch: boolean;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  scenario,
  onCopyPatch,
  copiedPatch,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified' | 'test'>('split');

  const origLines = scenario.original_code.split('\n');
  const fixedLines = scenario.fixed_code.split('\n');
  const diffLines = scenario.diff.split('\n');
  const testLines = scenario.test_code.split('\n');

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Diff Window Header */}
      <div style={{
        padding: '10px 16px',
        background: '#0a0f1c',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        {/* File name with Python icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1rem', display: 'flex' }}>🐍</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
            {scenario.file_path}
          </span>
        </div>

        {/* Window controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Mode Toggles */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: 2, borderRadius: 6 }}>
            <button
              onClick={() => setViewMode('split')}
              style={{
                border: 'none',
                background: viewMode === 'split' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: viewMode === 'split' ? '#ffffff' : 'var(--text-dim)',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Columns size={12} />
              <span>Split</span>
            </button>

            <button
              onClick={() => setViewMode('unified')}
              style={{
                border: 'none',
                background: viewMode === 'unified' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: viewMode === 'unified' ? '#ffffff' : 'var(--text-dim)',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Code size={12} />
              <span>Unified</span>
            </button>

            <button
              onClick={() => setViewMode('test')}
              style={{
                border: 'none',
                background: viewMode === 'test' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: viewMode === 'test' ? '#ffffff' : 'var(--text-dim)',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <TestTube size={12} />
              <span>Pytest File</span>
            </button>
          </div>

          <button
            onClick={onCopyPatch}
            className="btn btn-outline"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            title="Copy Git Patch"
          >
            {copiedPatch ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
            <span>{copiedPatch ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div style={{ flexGrow: 1, overflowY: 'auto', background: 'var(--bg-editor)' }}>
        {viewMode === 'split' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%', minHeight: 480 }}>
            {/* Left Column: Original Buggy Code */}
            <div style={{ borderRight: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
              <div style={{ padding: '6px 14px', background: 'rgba(244, 63, 94, 0.08)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-danger)' }}>
                ORIGINAL (Buggy Code in PR)
              </div>
              <div className="diff-code-table">
                {origLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isBuggy = (scenario.id === 'auth_idor' && lineNum >= 25 && lineNum <= 34) ||
                                  (scenario.id === 'logic_discount' && lineNum >= 22 && lineNum <= 29) ||
                                  (scenario.id === 'sql_injection' && lineNum >= 27 && lineNum <= 32);

                  return (
                    <div key={idx} className={`diff-line ${isBuggy ? 'diff-row-deleted' : ''}`}>
                      <span className="diff-num-cell">
                        {isBuggy ? `${lineNum} -` : lineNum}
                      </span>
                      <span className="diff-text-cell">
                        {highlightPython(line)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Patched Code */}
            <div style={{ overflowX: 'auto' }}>
              <div style={{ padding: '6px 14px', background: 'rgba(16, 185, 129, 0.08)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-success)' }}>
                PROPOSED FIX (Minimal Verified Patch)
              </div>
              <div className="diff-code-table">
                {fixedLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isFixed = (scenario.id === 'auth_idor' && lineNum >= 25 && lineNum <= 36) ||
                                  (scenario.id === 'logic_discount' && lineNum >= 22 && lineNum <= 32) ||
                                  (scenario.id === 'sql_injection' && lineNum >= 27 && lineNum <= 33);

                  return (
                    <div key={idx} className={`diff-line ${isFixed ? 'diff-row-added' : ''}`}>
                      <span className="diff-num-cell">
                        {isFixed ? `${lineNum} +` : lineNum}
                      </span>
                      <span className="diff-text-cell">
                        {highlightPython(line)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'unified' && (
          <div className="diff-code-table" style={{ padding: '8px 0' }}>
            {diffLines.map((line, idx) => {
              const isAdd = line.startsWith('+') && !line.startsWith('+++');
              const isDel = line.startsWith('-') && !line.startsWith('---');
              return (
                <div key={idx} className={`diff-line ${isAdd ? 'diff-row-added' : isDel ? 'diff-row-deleted' : ''}`}>
                  <span className="diff-num-cell">{idx + 1}</span>
                  <span className="diff-text-cell">
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'test' && (
          <div className="diff-code-table" style={{ padding: '8px 0' }}>
            <div style={{ padding: '6px 14px', color: 'var(--text-dim)', fontSize: '0.72rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: 6 }}>
              Targeted Sandbox Test: <code>{scenario.test_file}</code>
            </div>
            {testLines.map((line, idx) => (
              <div key={idx} className="diff-line">
                <span className="diff-num-cell">{idx + 1}</span>
                <span className="diff-text-cell">
                  {highlightPython(line)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

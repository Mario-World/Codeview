import React, { useState } from 'react';
import { Columns, FileCode, Check, Copy, TestTube, Sparkles } from 'lucide-react';
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
    <div className="glass-panel" style={{ padding: '20px', marginBottom: 24 }}>
      {/* Top Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileCode size={18} color="#818cf8" />
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
            Code Comparison & Minimal Patch
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>
            {scenario.file_path}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* View Mode Buttons */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setViewMode('split')}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'split' ? '#6366f1' : 'transparent',
                color: viewMode === 'split' ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Columns size={13} />
              <span>Side-by-Side</span>
            </button>

            <button
              onClick={() => setViewMode('unified')}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'unified' ? '#6366f1' : 'transparent',
                color: viewMode === 'unified' ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <FileCode size={13} />
              <span>Unified Diff</span>
            </button>

            <button
              onClick={() => setViewMode('test')}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'test' ? '#6366f1' : 'transparent',
                color: viewMode === 'test' ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <TestTube size={13} />
              <span>Targeted Pytest File</span>
            </button>
          </div>

          <button
            onClick={handleCopyPatch}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
            <span>{copied ? 'Copied .patch!' : 'Copy Git Patch'}</span>
          </button>
        </div>
      </div>

      {/* Render View Mode */}
      {viewMode === 'split' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Original Column */}
          <div className="terminal-window">
            <div className="terminal-header" style={{ borderLeft: '3px solid #f43f5e' }}>
              <span style={{ fontWeight: 700, color: '#f43f5e' }}>ORIGINAL (Current PR Code)</span>
              <span>{origLines.length} lines</span>
            </div>
            <div className="terminal-body" style={{ maxHeight: 380, padding: 0 }}>
              {origLines.map((line, idx) => {
                const lineNum = idx + 1;
                // Highlight defect area
                const isBuggyArea = (scenario.id === 'auth_idor' && lineNum >= 25 && lineNum <= 34) ||
                                    (scenario.id === 'logic_discount' && lineNum >= 22 && lineNum <= 29) ||
                                    (scenario.id === 'sql_injection' && lineNum >= 27 && lineNum <= 32);

                return (
                  <div
                    key={idx}
                    className="diff-line"
                    style={{ background: isBuggyArea ? 'rgba(244, 63, 94, 0.12)' : 'transparent' }}
                  >
                    <span className="diff-line-number" style={{ color: isBuggyArea ? '#f43f5e' : undefined }}>
                      {lineNum}
                    </span>
                    <span className="diff-content" style={{ color: isBuggyArea ? '#fecdd3' : '#cbd5e1' }}>
                      {line}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patched Column */}
          <div className="terminal-window">
            <div className="terminal-header" style={{ borderLeft: '3px solid #10b981' }}>
              <span style={{ fontWeight: 700, color: '#10b981' }}>PROPOSED PATCH (Verified Candidate)</span>
              <span>{fixedLines.length} lines</span>
            </div>
            <div className="terminal-body" style={{ maxHeight: 380, padding: 0 }}>
              {fixedLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isFixedArea = (scenario.id === 'auth_idor' && lineNum >= 25 && lineNum <= 36) ||
                                    (scenario.id === 'logic_discount' && lineNum >= 22 && lineNum <= 32) ||
                                    (scenario.id === 'sql_injection' && lineNum >= 27 && lineNum <= 33);

                return (
                  <div
                    key={idx}
                    className="diff-line"
                    style={{ background: isFixedArea ? 'rgba(16, 185, 129, 0.12)' : 'transparent' }}
                  >
                    <span className="diff-line-number" style={{ color: isFixedArea ? '#10b981' : undefined }}>
                      {lineNum}
                    </span>
                    <span className="diff-content" style={{ color: isFixedArea ? '#6ee7b7' : '#cbd5e1' }}>
                      {line}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'unified' && (
        <div className="terminal-window">
          <div className="terminal-header">
            <span>UNIFIED DIFF (git format-patch compatible)</span>
            <span>{diffLines.length} diff lines</span>
          </div>
          <div className="terminal-body" style={{ maxHeight: 380, padding: 0 }}>
            {diffLines.map((line, idx) => {
              const isAdd = line.startsWith('+') && !line.startsWith('+++');
              const isRem = line.startsWith('-') && !line.startsWith('---');
              const isMeta = line.startsWith('@@') || line.startsWith('diff') || line.startsWith('index');

              let lineClass = 'diff-line';
              if (isAdd) lineClass += ' diff-added';
              if (isRem) lineClass += ' diff-removed';

              return (
                <div key={idx} className={lineClass}>
                  <span className="diff-line-number">{idx + 1}</span>
                  <span
                    className="diff-content"
                    style={{
                      color: isMeta ? '#818cf8' : undefined,
                      fontWeight: isMeta ? 700 : undefined,
                    }}
                  >
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'test' && (
        <div className="terminal-window">
          <div className="terminal-header" style={{ borderLeft: '3px solid #6366f1' }}>
            <span style={{ fontWeight: 700, color: '#818cf8' }}>
              TARGETED VERIFICATION TEST ({scenario.test_file})
            </span>
            <span>{testLines.length} lines</span>
          </div>
          <div className="terminal-body" style={{ maxHeight: 380, padding: 0 }}>
            {testLines.map((line, idx) => (
              <div key={idx} className="diff-line">
                <span className="diff-line-number">{idx + 1}</span>
                <span className="diff-content" style={{ color: '#cbd5e1' }}>{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

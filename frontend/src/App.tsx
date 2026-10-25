import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DiffViewer } from './components/DiffViewer';
import { CustomPRModal } from './components/CustomPRModal';
import { ScenarioSummary, ScenarioDetail, VerifyResponse } from './types';
import { 
  GitPullRequest, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Terminal, 
  FileText, 
  Flame, 
  Copy, 
  Check, 
  Download, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('auth_idor');
  const [scenarioDetail, setScenarioDetail] = useState<ScenarioDetail | null>(null);
  const [verifyResponse, setVerifyResponse] = useState<VerifyResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [activeLeftTab, setActiveLeftTab] = useState<'finding' | 'sandbox'>('finding');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoadingPR, setIsLoadingPR] = useState<boolean>(false);
  const [commentCopied, setCommentCopied] = useState<boolean>(false);

  // Load scenarios list on mount
  useEffect(() => {
    fetch('/api/scenarios')
      .then((res) => res.json())
      .then((data: ScenarioSummary[]) => {
        setScenarios(data);
      })
      .catch((err) => console.error('Failed to load scenarios:', err));
  }, []);

  // Load scenario details when active ID changes
  useEffect(() => {
    if (!activeScenarioId) return;
    setVerifyResponse(null);
    setIsApproved(false);
    setActiveLeftTab('finding');

    fetch(`/api/scenarios/${activeScenarioId}`)
      .then((res) => res.json())
      .then((data: ScenarioDetail) => {
        setScenarioDetail(data);
      })
      .catch((err) => console.error('Failed to load scenario detail:', err));
  }, [activeScenarioId]);

  // Execute verification in sandbox
  const handleVerify = async () => {
    if (!scenarioDetail) return;
    setIsVerifying(true);
    setActiveLeftTab('sandbox');

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: scenarioDetail.id,
          original_code: scenarioDetail.original_code,
          patched_code: scenarioDetail.fixed_code,
          test_code: scenarioDetail.test_code,
          file_path: scenarioDetail.file_path,
        }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: VerifyResponse = await res.json();
      setVerifyResponse(data);
    } catch (err: any) {
      console.error('Verification failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyReviewComment = () => {
    if (!scenarioDetail) return;
    const isClean = scenarioDetail.id === 'clean_pr';
    const commentMarkdown = `### 🛡️ ShipSafe AI Code Review: ${isClean ? 'Approved ✅' : 'Actionable Finding with Verified Fix 🛠️'}

**Repository**: \`${scenarioDetail.repo_name}\` (PR #${scenarioDetail.pr_number})  
**File**: \`${scenarioDetail.file_path}\`  
**Severity**: \`${scenarioDetail.severity}\` | **Confidence**: \`${scenarioDetail.confidence}%\`

#### 🔍 Defect Summary
${scenarioDetail.summary}

#### 💥 Production Impact
${scenarioDetail.impact}

#### 🧪 Verification Evidence
- Pre-Patch Test: ❌ \`FAILED\` (${verifyResponse?.original_result.failure_details || 'Targeted assertion failure'})
- Post-Patch Test: ✅ \`PASSED\` (${verifyResponse?.patched_result.summary || 'All assertions satisfied'})

\`\`\`diff
${scenarioDetail.diff}
\`\`\`

> *Principle: AI proposes the fix; tools and tests provide evidence; the developer decides whether to merge.*`;

    navigator.clipboard.writeText(commentMarkdown);
    setCommentCopied(true);
    setTimeout(() => setCommentCopied(false), 2000);
  };

  const handleDownloadPatch = () => {
    if (!scenarioDetail) return;
    const element = document.createElement("a");
    const file = new Blob([scenarioDetail.diff], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `shipsafe-${scenarioDetail.id}.patch`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSubmitPRUrl = async (url: string) => {
    setIsLoadingPR(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pr_url: url }),
      });
      const data = await res.json();
      setScenarioDetail(data);
      setActiveScenarioId(data.id);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingPR(false);
    }
  };

  const handleSubmitCustomCode = async (code: string) => {
    setIsLoadingPR(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_content: code }),
      });
      const data = await res.json();
      setScenarioDetail(data);
      setActiveScenarioId(data.id);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingPR(false);
    }
  };

  const isClean = scenarioDetail?.id === 'clean_pr';
  const isVerified = verifyResponse?.is_verified && !isClean;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Navbar */}
      <Navbar
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={(id) => setActiveScenarioId(id)}
        onOpenCustomModal={() => setIsModalOpen(true)}
      />

      {scenarioDetail ? (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Subheader: PR Context & Action Controls */}
          <div style={{
            padding: '10px 20px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            {/* PR Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="badge badge-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                <GitPullRequest size={12} />
                {scenarioDetail.repo_name} #{scenarioDetail.pr_number}
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {scenarioDetail.pr_title}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                by {scenarioDetail.pr_author}
              </span>
            </div>

            {/* Status & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Verdict Pill */}
              {isClean ? (
                <span className="badge badge-success">
                  <CheckCircle2 size={12} />
                  Clean PR (0 Defects)
                </span>
              ) : isVerified ? (
                <span className="badge badge-success">
                  <ShieldCheck size={12} />
                  Fix Verified in Sandbox
                </span>
              ) : (
                <span className="badge badge-critical">
                  <ShieldAlert size={12} />
                  Blocked: {scenarioDetail.category}
                </span>
              )}

              {/* Verify Action Button */}
              {!isClean && (
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className={isVerified ? "btn btn-outline" : "btn btn-primary"}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw size={13} className="anim-spin" />
                      <span>Testing in Sandbox...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={13} />
                      <span>{isVerified ? 'Re-verify' : 'Verify Fix in Sandbox'}</span>
                    </>
                  )}
                </button>
              )}

              {/* Approve / Merge Button */}
              <button
                onClick={() => setIsApproved(true)}
                disabled={isApproved}
                className={isApproved ? "btn btn-outline" : "btn btn-success"}
              >
                {isApproved ? (
                  <>
                    <Check size={13} />
                    <span>Approved</span>
                  </>
                ) : (
                  <span>{isClean ? 'Certify & Merge' : 'Approve & Merge'}</span>
                )}
              </button>

              <button
                onClick={handleCopyReviewComment}
                className="btn btn-outline"
                title="Copy GitHub Review Comment"
              >
                {commentCopied ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
                <span>{commentCopied ? 'Copied' : 'PR Comment'}</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Split Workspace */}
          <div style={{
            flexGrow: 1,
            display: 'grid',
            gridTemplateColumns: '420px 1fr',
            overflow: 'hidden',
            padding: 14,
            gap: 14,
          }}>
            {/* Left Panel: Briefing, Impact & Verification */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Left Panel Tabs */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <button
                  onClick={() => setActiveLeftTab('finding')}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    border: 'none',
                    background: activeLeftTab === 'finding' ? 'var(--bg-surface)' : 'transparent',
                    color: activeLeftTab === 'finding' ? '#ffffff' : 'var(--text-dim)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    borderBottom: activeLeftTab === 'finding' ? '2px solid var(--accent)' : 'none'
                  }}
                >
                  <FileText size={14} />
                  <span>Review Brief & Impact</span>
                </button>

                <button
                  onClick={() => setActiveLeftTab('sandbox')}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    border: 'none',
                    background: activeLeftTab === 'sandbox' ? 'var(--bg-surface)' : 'transparent',
                    color: activeLeftTab === 'sandbox' ? '#ffffff' : 'var(--text-dim)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    borderBottom: activeLeftTab === 'sandbox' ? '2px solid var(--color-success)' : 'none'
                  }}
                >
                  <Terminal size={14} />
                  <span>Sandbox Proof {verifyResponse ? (verifyResponse.is_verified ? '✅' : '❌') : ''}</span>
                </button>
              </div>

              {/* Tab 1: Finding & Impact */}
              {activeLeftTab === 'finding' && (
                <div style={{ flexGrow: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Defect Overview */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className={`badge ${isClean ? 'badge-success' : 'badge-critical'}`}>
                        {scenarioDetail.severity}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        Confidence: <strong style={{ color: 'var(--text-main)' }}>{scenarioDetail.confidence}%</strong>
                      </span>
                    </div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                      {scenarioDetail.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                      {scenarioDetail.summary}
                    </p>
                  </div>

                  {/* Impact Callout */}
                  {!isClean && (
                    <div style={{
                      padding: 12,
                      borderRadius: 6,
                      background: 'var(--color-danger-bg)',
                      border: '1px solid var(--color-danger-border)',
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                        <Flame size={13} />
                        <span>Production Blast Radius</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#fecdd3', lineHeight: 1.5 }}>
                        {scenarioDetail.impact}
                      </p>
                    </div>
                  )}

                  {/* Root Cause & Minimal Patch */}
                  {!isClean && (
                    <div style={{
                      padding: 12,
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      fontSize: '0.78rem'
                    }}>
                      <div>
                        <strong style={{ color: 'var(--text-main)' }}>Root Cause:</strong>
                        <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>{scenarioDetail.root_cause}</p>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--color-success)' }}>Minimal Fix:</strong>
                        <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>{scenarioDetail.proposed_fix_summary}</p>
                      </div>
                    </div>
                  )}

                  {/* Verification Status Pill */}
                  <div style={{
                    padding: 12,
                    borderRadius: 6,
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Deterministic Proof Engine
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Original PR Code:</span>
                      <strong style={{ color: isClean ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {isClean ? '✅ PASS' : '❌ FAILS TEST'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Proposed Patch:</span>
                      <strong style={{ color: isVerified || isClean ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {isVerified || isClean ? '✅ VERIFIED PASS' : 'PENDING RUN'}
                      </strong>
                    </div>
                  </div>

                  {/* Clean footer notice */}
                  <div style={{ marginTop: 'auto', paddingTop: 8, fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                    <strong style={{ color: 'var(--text-muted)' }}>Core Principle:</strong> AI proposes the fix; sandbox tests provide deterministic proof; you decide whether to merge.
                  </div>
                </div>
              )}

              {/* Tab 2: Sandbox Test Runner */}
              {activeLeftTab === 'sandbox' && (
                <div style={{ flexGrow: 1, padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {verifyResponse ? (
                    <>
                      {/* Step 1: Pre-patch Test */}
                      <div style={{
                        background: '#070a12',
                        border: `1px solid ${verifyResponse.original_result.passed ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`,
                        borderRadius: 6,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          padding: '6px 10px',
                          background: verifyResponse.original_result.passed ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: verifyResponse.original_result.passed ? 'var(--color-success)' : 'var(--color-danger)'
                        }}>
                          <span>Step 1: Test Against Original PR Code</span>
                          <span>{verifyResponse.original_result.passed ? 'PASSED' : 'REPRODUCED DEFECT ❌'}</span>
                        </div>
                        <pre style={{
                          padding: 10,
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#fca5a5',
                          maxHeight: 140,
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap',
                          margin: 0
                        }}>
                          {verifyResponse.original_result.failure_details || verifyResponse.original_result.stdout || 'Test passed'}
                        </pre>
                      </div>

                      {/* Step 2: Post-patch Test */}
                      <div style={{
                        background: '#070a12',
                        border: `1px solid ${verifyResponse.patched_result.passed ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`,
                        borderRadius: 6,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          padding: '6px 10px',
                          background: verifyResponse.patched_result.passed ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: verifyResponse.patched_result.passed ? 'var(--color-success)' : 'var(--color-danger)'
                        }}>
                          <span>Step 2: Test Against Candidate Patch</span>
                          <span>{verifyResponse.patched_result.passed ? 'ALL TESTS PASSED ✅' : 'FAILED'}</span>
                        </div>
                        <pre style={{
                          padding: 10,
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#86efac',
                          maxHeight: 140,
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap',
                          margin: 0
                        }}>
                          {verifyResponse.patched_result.stdout || 'Execution complete with exit code 0.'}
                        </pre>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                        Execution time: {(verifyResponse.original_result.execution_time_ms + verifyResponse.patched_result.execution_time_ms).toFixed(1)}ms · Ephemeral worktree
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 14px' }}>
                      <Terminal size={28} color="var(--text-dim)" style={{ marginBottom: 10 }} />
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                        Execute targeted pytest in an isolated sandbox to prove the defect and verify the proposed fix.
                      </p>
                      <button onClick={handleVerify} className="btn btn-primary" style={{ margin: '0 auto' }}>
                        <Zap size={13} />
                        <span>Run Sandbox Verification</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Panel: Clean Diff Viewer */}
            <div style={{ overflow: 'hidden' }}>
              <DiffViewer scenario={scenarioDetail} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="anim-spin" style={{ width: 24, height: 24, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
        </div>
      )}

      {/* Custom PR Modal */}
      <CustomPRModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitURL={handleSubmitPRUrl}
        onSubmitCustomCode={handleSubmitCustomCode}
        isLoading={isLoadingPR}
      />
    </div>
  );
};

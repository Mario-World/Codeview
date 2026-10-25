import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ReviewCards } from './components/ReviewCards';
import { DiffViewer } from './components/DiffViewer';
import { CustomPRModal } from './components/CustomPRModal';
import { ScenarioSummary, ScenarioDetail, VerifyResponse } from './types';
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  MoreHorizontal, 
  ShieldCheck, 
  Copy, 
  CheckCircle2,
  FileCode
} from 'lucide-react';

export const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('auth_idor');
  const [scenarioDetail, setScenarioDetail] = useState<ScenarioDetail | null>(null);
  const [verifyResponse, setVerifyResponse] = useState<VerifyResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'reviewed'>('active');
  const [scenarioDropdownOpen, setScenarioDropdownOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoadingPR, setIsLoadingPR] = useState<boolean>(false);
  const [copiedPatch, setCopiedPatch] = useState<boolean>(false);

  // Fetch scenarios list on mount
  useEffect(() => {
    fetch('/api/scenarios')
      .then((res) => res.json())
      .then((data: ScenarioSummary[]) => {
        setScenarios(data);
      })
      .catch((err) => console.error('Failed to load scenarios:', err));
  }, []);

  // Fetch scenario details when active ID changes
  useEffect(() => {
    if (!activeScenarioId) return;
    setVerifyResponse(null);
    setIsApproved(false);

    fetch(`/api/scenarios/${activeScenarioId}`)
      .then((res) => res.json())
      .then((data: ScenarioDetail) => {
        setScenarioDetail(data);
      })
      .catch((err) => console.error('Failed to load scenario detail:', err));
  }, [activeScenarioId]);

  // Execute verification in isolated sandbox
  const handleVerify = async () => {
    if (!scenarioDetail) return;
    setIsVerifying(true);

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
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyPatch = () => {
    if (!scenarioDetail) return;
    navigator.clipboard.writeText(scenarioDetail.diff);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  const handleNextScenario = () => {
    if (scenarios.length === 0) return;
    const currentIndex = scenarios.findIndex((s) => s.id === activeScenarioId);
    const nextIndex = (currentIndex + 1) % scenarios.length;
    setActiveScenarioId(scenarios[nextIndex].id);
  };

  const handlePrevScenario = () => {
    if (scenarios.length === 0) return;
    const currentIndex = scenarios.findIndex((s) => s.id === activeScenarioId);
    const prevIndex = (currentIndex - 1 + scenarios.length) % scenarios.length;
    setActiveScenarioId(scenarios[prevIndex].id);
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

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* 2. SUB-NAV CONTROL BAR */}
      <div style={{
        height: 48,
        background: 'var(--bg-app)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        {/* Left Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Active Finding / Reviewed Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 6, padding: 2 }}>
            <button
              onClick={() => setActiveSubTab('active')}
              style={{
                border: 'none',
                background: activeSubTab === 'active' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: activeSubTab === 'active' ? '#ffffff' : 'var(--text-dim)',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Active Finding
            </button>
            <button
              onClick={() => setActiveSubTab('reviewed')}
              style={{
                border: 'none',
                background: activeSubTab === 'reviewed' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: activeSubTab === 'reviewed' ? '#ffffff' : 'var(--text-dim)',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reviewed
            </button>
          </div>

          {/* Scenario Dropdown Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setScenarioDropdownOpen(!scenarioDropdownOpen)}
              className="btn btn-outline"
              style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4 }}
            >
              <span>Scenario: <strong style={{ color: '#ffffff' }}>{scenarioDetail ? scenarioDetail.id.replace('_', ' ').toUpperCase() : 'SELECT'}</strong></span>
              <ChevronDown size={12} />
            </button>

            {scenarioDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 4,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                borderRadius: 8,
                padding: 4,
                width: 220,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                zIndex: 50
              }}>
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveScenarioId(s.id);
                      setScenarioDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 10px',
                      background: s.id === activeScenarioId ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      color: s.id === activeScenarioId ? '#ffffff' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{s.title.substring(0, 24)}...</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>#{s.pr_number}</span>
                  </button>
                ))}

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setScenarioDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 10px',
                    background: 'transparent',
                    color: 'var(--accent)',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  + Custom PR / Diff
                </button>
              </div>
            )}
          </div>

          {/* Breadcrumb Info Pill */}
          {scenarioDetail && (
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)'
            }}>
              PR #{scenarioDetail.pr_number} | {scenarioDetail.repo_name} | {isClean ? 'Clean Review' : '1 Defect Identified'}
            </div>
          )}
        </div>

        {/* Right Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={handlePrevScenario}
            className="btn btn-outline"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
          >
            <ChevronLeft size={12} />
            <span>Prev</span>
          </button>

          <button
            onClick={handleNextScenario}
            className="btn btn-outline"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
          >
            <span>Next</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE */}
      {scenarioDetail ? (
        <div style={{
          flexGrow: 1,
          display: 'grid',
          gridTemplateColumns: '430px 1fr',
          padding: 16,
          gap: 16,
          overflow: 'hidden'
        }}>
          {/* Left Column: Review Cards */}
          <ReviewCards
            scenario={scenarioDetail}
            verifyResponse={verifyResponse}
            isVerifying={isVerifying}
            onVerify={handleVerify}
          />

          {/* Right Column: Fix Title & Code Diff Window */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* PR Action Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              flexShrink: 0
            }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                {scenarioDetail.pr_title}
              </h1>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn btn-outline" style={{ padding: '6px 8px' }}>
                  <MoreHorizontal size={16} />
                </button>

                <button
                  onClick={() => setIsApproved(true)}
                  disabled={isApproved}
                  className="btn btn-success"
                  style={{ padding: '7px 16px', fontSize: '0.84rem' }}
                >
                  {isApproved ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Approved</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      <span>{isClean ? 'Certify & Merge' : 'Approve'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyPatch}
                  className="btn btn-outline"
                  style={{ padding: '7px 14px', fontSize: '0.84rem' }}
                >
                  <span>Request Changes</span>
                </button>
              </div>
            </div>

            {/* Diff Window */}
            <div style={{ flexGrow: 1, overflow: 'hidden' }}>
              <DiffViewer
                scenario={scenarioDetail}
                onCopyPatch={handleCopyPatch}
                copiedPatch={copiedPatch}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="anim-spin" style={{ width: 28, height: 28, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
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

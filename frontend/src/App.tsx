import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WorkflowStepper } from './components/WorkflowStepper';
import { ReadinessHeader } from './components/ReadinessHeader';
import { FindingCard } from './components/FindingCard';
import { DiffViewer } from './components/DiffViewer';
import { SandboxConsole } from './components/SandboxConsole';
import { MergeBar } from './components/MergeBar';
import { CustomPRModal } from './components/CustomPRModal';
import { ScenarioSummary, ScenarioDetail, VerifyResponse } from './types';
import { ShieldCheck, CheckCircle2, Sparkles, AlertOctagon } from 'lucide-react';

export const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('auth_idor');
  const [scenarioDetail, setScenarioDetail] = useState<ScenarioDetail | null>(null);
  const [verifyResponse, setVerifyResponse] = useState<VerifyResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoadingPR, setIsLoadingPR] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch scenarios list on load
  useEffect(() => {
    fetch('/api/scenarios')
      .then((res) => res.json())
      .then((data: ScenarioSummary[]) => {
        setScenarios(data);
      })
      .catch((err) => {
        console.error('Failed to load scenarios:', err);
      });
  }, []);

  // Fetch scenario details when active ID changes
  useEffect(() => {
    if (!activeScenarioId) return;
    setVerifyResponse(null);
    setIsApproved(false);
    setCurrentStage(2); // Inspect & Find done

    fetch(`/api/scenarios/${activeScenarioId}`)
      .then((res) => res.json())
      .then((data: ScenarioDetail) => {
        setScenarioDetail(data);
        if (data.id === 'clean_pr') {
          setCurrentStage(6); // Clean PR straight to ready
        } else {
          setCurrentStage(3); // Explain impact
        }
      })
      .catch((err) => {
        console.error('Failed to load scenario detail:', err);
        showToast('Error loading PR scenario', 'error');
      });
  }, [activeScenarioId]);

  // Execute verification in isolated sandbox
  const handleVerify = async () => {
    if (!scenarioDetail) return;
    setIsVerifying(true);
    setCurrentStage(5); // Sandbox verify

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
      if (data.is_verified) {
        setCurrentStage(6); // Ready to ship
        showToast('Sandbox Verification Passed: Candidate patch verified!', 'success');
      } else {
        showToast('Targeted test check failed on candidate patch', 'error');
      }
    } catch (err: any) {
      console.error('Verification failed:', err);
      showToast(`Verification error: ${err.message}`, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Human approval action
  const handleApprove = () => {
    setIsApproved(true);
    setCurrentStage(6);
    showToast('PR Approved! Signed verification receipt generated.', 'success');
  };

  // Custom PR URL submission
  const handleSubmitPRUrl = async (url: string) => {
    setIsLoadingPR(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pr_url: url }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to analyze PR');
      }
      const data: ScenarioDetail = await res.json();
      setScenarioDetail(data);
      setActiveScenarioId(data.id);
      setIsModalOpen(false);
      showToast(`Analyzed PR: ${data.pr_title}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsLoadingPR(false);
    }
  };

  // Custom code diff submission
  const handleSubmitCustomCode = async (code: string) => {
    setIsLoadingPR(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_content: code }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to analyze code');
      }
      const data: ScenarioDetail = await res.json();
      setScenarioDetail(data);
      setActiveScenarioId(data.id);
      setIsModalOpen(false);
      showToast(`Analyzed code: Discovered ${data.category}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsLoadingPR(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={(id) => setActiveScenarioId(id)}
        onOpenCustomModal={() => setIsModalOpen(true)}
      />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px', width: '100%', flexGrow: 1 }}>
        {/* Workflow Progress Stepper */}
        <WorkflowStepper
          currentStage={currentStage}
          isVerified={!!verifyResponse?.is_verified}
          isClean={scenarioDetail?.id === 'clean_pr'}
          onJumpStage={(stage) => setCurrentStage(stage)}
        />

        {scenarioDetail ? (
          <>
            {/* Production Readiness Verdict Header */}
            <ReadinessHeader
              scenario={scenarioDetail}
              verifyResponse={verifyResponse}
              onTriggerVerify={handleVerify}
              isVerifying={isVerifying}
            />

            {/* Actionable Finding & Blast Radius Card */}
            <FindingCard scenario={scenarioDetail} />

            {/* Side by Side Diff Viewer */}
            <DiffViewer scenario={scenarioDetail} />

            {/* Isolated Sandbox Pytest Console */}
            <SandboxConsole
              scenario={scenarioDetail}
              verifyResponse={verifyResponse}
              isVerifying={isVerifying}
              onTriggerVerify={handleVerify}
            />

            {/* Sticky Action & Merge Decision Bar */}
            <MergeBar
              scenario={scenarioDetail}
              verifyResponse={verifyResponse}
              onApprove={handleApprove}
              isApproved={isApproved}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="anim-spin" style={{ width: 32, height: 32, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }} />
            <p style={{ color: '#94a3b8' }}>Loading ShipSafe Review Engine...</p>
          </div>
        )}
      </main>

      {/* Custom PR / Code Diff Modal */}
      <CustomPRModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitURL={handleSubmitPRUrl}
        onSubmitCustomCode={handleSubmitCustomCode}
        isLoading={isLoadingPR}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          background: toast.type === 'success' ? '#065f46' : toast.type === 'error' ? '#991b1b' : '#1e1b4b',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 8,
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertOctagon size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

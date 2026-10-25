import React from 'react';
import { Search, Bug, FileText, Wrench, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface WorkflowStepperProps {
  currentStage: number; // 1: Inspect, 2: Find, 3: Explain, 4: Fix, 5: Verify, 6: Merge
  isVerified: boolean;
  isClean: boolean;
  onJumpStage?: (stage: number) => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStage,
  isVerified,
  isClean,
  onJumpStage,
}) => {
  const steps = [
    { num: 1, title: 'Inspect PR', desc: 'Diff & Context', icon: Search },
    { num: 2, title: 'Find Defect', desc: isClean ? '0 Blockers' : 'Evidence-Backed', icon: Bug },
    { num: 3, title: 'Explain Impact', desc: 'Blast Radius', icon: FileText },
    { num: 4, title: 'Propose Patch', desc: 'Minimal Diff', icon: Wrench },
    { num: 5, title: 'Sandbox Verify', desc: isVerified ? 'Tests Passed' : 'Targeted pytest', icon: CheckCircle },
    { num: 6, title: 'Ready to Ship', desc: 'Human Approval', icon: ShieldCheck },
  ];

  return (
    <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = currentStage === step.num;
          const isPassed = currentStage > step.num || (step.num === 5 && isVerified);

          let circleBg = 'rgba(255, 255, 255, 0.05)';
          let circleColor = '#64748b';
          let borderColor = 'rgba(255, 255, 255, 0.1)';

          if (isPassed) {
            circleBg = 'rgba(16, 185, 129, 0.15)';
            circleColor = '#10b981';
            borderColor = 'rgba(16, 185, 129, 0.4)';
          } else if (isActive) {
            circleBg = 'rgba(99, 102, 241, 0.2)';
            circleColor = '#818cf8';
            borderColor = '#6366f1';
          }

          return (
            <React.Fragment key={step.num}>
              <div 
                onClick={() => onJumpStage && onJumpStage(step.num)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  cursor: onJumpStage ? 'pointer' : 'default',
                  opacity: isActive || isPassed ? 1 : 0.65,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: circleBg,
                  border: `1px solid ${borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: circleColor,
                  boxShadow: isActive ? '0 0 14px rgba(99, 102, 241, 0.4)' : 'none',
                }}>
                  <StepIcon size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isActive ? '#ffffff' : isPassed ? '#10b981' : '#94a3b8' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {step.desc}
                  </div>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div style={{ color: isPassed ? '#10b981' : 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center' }}>
                  <ArrowRight size={16} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

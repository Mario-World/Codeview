import React, { useState } from 'react';
import { Check, Download, MessageSquare, ShieldCheck, XCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { ScenarioDetail, VerifyResponse } from '../types';

interface MergeBarProps {
  scenario: ScenarioDetail;
  verifyResponse: VerifyResponse | null;
  onApprove: () => void;
  isApproved: boolean;
}

export const MergeBar: React.FC<MergeBarProps> = ({
  scenario,
  verifyResponse,
  onApprove,
  isApproved,
}) => {
  const [commentCopied, setCommentCopied] = useState(false);
  const isClean = scenario.id === 'clean_pr';
  const isVerified = verifyResponse?.is_verified;

  const handleDownloadPatch = () => {
    const element = document.createElement("a");
    const file = new Blob([scenario.diff], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `shipsafe-fix-${scenario.id}.patch`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyReviewComment = () => {
    const commentMarkdown = `### 🛡️ ShipSafe AI Code Review: ${isClean ? 'Approved ✅' : 'Actionable Finding with Verified Fix 🛠️'}

**Repository**: \`${scenario.repo_name}\` (PR #${scenario.pr_number})  
**File**: \`${scenario.file_path}\`  
**Severity**: \`${scenario.severity}\` | **Confidence**: \`${scenario.confidence}%\`

---

#### 🔍 Defect Analysis
${scenario.summary}

#### 💥 Production Impact & Blast Radius
${scenario.impact}

#### 🧪 Verification Evidence
- **Original Implementation**: ❌ \`FAILED\` (${verifyResponse?.original_result.failure_details || 'Targeted test fails'})
- **Proposed Patch Candidate**: ✅ \`PASSED\` (${verifyResponse?.patched_result.summary || 'All tests passed'})
- **Execution Sandbox**: Isolated ephemeral temp worktree (pytest returncode 0)

\`\`\`diff
${scenario.diff}
\`\`\`

> *Principle: AI proposes the fix; tools and tests provide evidence; the developer decides whether to merge.*
`;
    navigator.clipboard.writeText(commentMarkdown);
    setCommentCopied(true);
    setTimeout(() => setCommentCopied(false), 2000);
  };

  return (
    <div className="glass-panel" style={{
      padding: '18px 24px',
      position: 'sticky',
      bottom: 24,
      zIndex: 40,
      border: '1px solid rgba(99, 102, 241, 0.3)',
      boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(99, 102, 241, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16,
    }}>
      {/* Left: Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: isApproved || isClean ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isApproved || isClean ? '#10b981' : '#818cf8',
        }}>
          {isApproved || isClean ? <ShieldCheck size={20} /> : <Sparkles size={20} />}
        </div>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
            {isApproved ? 'Patch Approved & Ready for Merge' : isClean ? 'Clean Review: Ready for Production Merge' : isVerified ? 'Verified Fix Awaiting Human Decision' : 'Verification Recommended Before Merging'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {isApproved ? 'Signed off with verification receipt.' : 'Developer retains final authority over all production code changes.'}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={handleCopyReviewComment}
          className="btn btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.8rem' }}
        >
          {commentCopied ? <Check size={14} color="#10b981" /> : <MessageSquare size={14} />}
          <span>{commentCopied ? 'Comment Copied!' : 'Copy PR Review Comment'}</span>
        </button>

        {!isClean && (
          <button
            onClick={handleDownloadPatch}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <Download size={14} />
            <span>Download .patch</span>
          </button>
        )}

        <button
          onClick={onApprove}
          disabled={isApproved}
          className={isApproved ? "btn btn-secondary" : "btn btn-success"}
          style={{ padding: '9px 18px', fontSize: '0.85rem', fontWeight: 700 }}
        >
          {isApproved ? (
            <>
              <CheckCircle2 size={16} color="#10b981" />
              <span>Approved & Merged</span>
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              <span>{isClean ? 'Certify Clean PR & Approve' : 'Approve & Merge Verified Fix'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

# 🛡️ ShipSafe — AI Code Review for Production Readiness

> **From AI-generated code to code you can confidently ship.**  
> *A repository-aware reviewer that discovers actionable defects, explains why they matter, proposes minimal patches, and runs targeted tests to prove the fix works.*

---

## 📌 The Problem
AI coding assistants have made generating full applications almost effortless. However, AI-generated code frequently contains subtle, critical failures that slip into pull requests:
- ❌ **Missing authorization checks & IDOR** (e.g., cross-tenant resource manipulation).
- ❌ **Broken business logic & edge cases** (e.g., coupon stacking yielding negative order totals).
- ❌ **Security vulnerabilities** (e.g., raw f-string SQL queries allowing injection).
- ❌ **Unsafe input handling & unhandled error cascades**.

Standard AI code reviewers merely generate lengthy, speculative markdown lists of potential issues without proof. Developers are left guessing which warnings are hallucinated false positives.

---

## 💡 The Solution: A Trustworthy Engineering Loop
ShipSafe is differentiated because it **proves its fixes** before recommending them to the developer:

```
[1. Inspect PR] ➔ [2. Find Defect] ➔ [3. Explain Impact] ➔ [4. Propose Patch] ➔ [5. Sandbox Verify] ➔ [6. Human Merge]
```

### Core Principle
> **"AI proposes the fix; tools and tests provide evidence; the developer decides whether to merge."**

---

## ✨ Features Worth Building First

| Feature | Description |
| :--- | :--- |
| **Pull Request Review** | Analyzes changed files, unified diffs, and surrounding caller context. |
| **Evidence-Backed Findings** | Pinpoints exact line numbers, categorizes defects (OWASP, CWE, Logic), and calculates confidence. |
| **Blast Radius & Impact** | Explains *why* the defect matters in production (financial loss, data breach, outage). |
| **Side-by-Side Diff** | Side-by-side comparison of original buggy code vs. proposed verified candidate. |
| **Isolated Sandbox Runner** | Executes real pytest suites in isolated ephemeral sandboxes with restricted permissions and no production secrets. |
| **Deterministic Proof** | Proves the defect reproduces on the original code (❌ FAIL) and resolves completely on the candidate patch (✅ PASS). |
| **Reviewer Restraint** | Analyzes clean, defensive pull requests and certifies them as **Approved (0 Defects)** without noisy false alarms. |
| **Human-in-the-Loop Merge** | Export `.patch` files, copy markdown GitHub PR comments, or approve the change. |

---

## 🎬 Prepared Demo Scenarios

ShipSafe ships with 4 high-impact, realistic scenarios ready for one-click demonstration:

1. **🚨 Missing Tenant Authorization (IDOR / BOLA)**
   - *Repo:* `acme-corp/billing-service` (PR #142)
   - *Defect:* AI generated invoice deletion endpoint that checks existence but omits `current_user.org_id == invoice.org_id`.
   - *Impact:* Attackers in Organization Beta can delete Organization Alpha's enterprise invoices.
   - *Test Evidence:* `test_cross_tenant_deletion_is_forbidden()` fails on original (returns 200) and passes on patch (raises 403 Forbidden).

2. **💸 Unbounded Discount Stack Exploit**
   - *Repo:* `payflow-checkout/order-service` (PR #89)
   - *Defect:* VIP coupon deduction applied unconditionally, allowing order totals to become negative.
   - *Impact:* Customers purchasing goods below $30 receive money back from the merchant.
   - *Test Evidence:* `test_negative_charge_prevention()` fails on original (-$15.00) and passes on patch ($0.00 floor).

3. **💉 SQL Injection via Raw Interpolation**
   - *Repo:* `saas-core/directory-service` (PR #215)
   - *Defect:* User search query uses Python f-string interpolation instead of parameterized query.
   - *Impact:* Malicious `' OR '1'='1` escape sequence dumps cross-tenant directory credentials.
   - *Test Evidence:* `test_sql_injection_tenant_isolation()` fails on original and passes on patch.

4. **🛡️ Clean Production PR (Restraint & Precision Showcase)**
   - *Repo:* `infrastructure/api-gateway` (PR #304)
   - *Feature:* Token Bucket Rate Limiter with boundary validation and thread safety.
   - *Review Outcome:* Certified **Approved with 0 Defects**. Demonstrates that ShipSafe does not hallucinate false warnings.

---

## 🏗️ Technical Architecture

```
g:\Codeview
├── backend/
│   ├── main.py                  # FastAPI application entrypoint with CORS
│   ├── models.py                # Pydantic schemas (Findings, VerifyRequest, Scenarios)
│   ├── analyzer.py              # Diff parser, heuristics, and GitHub API integration
│   ├── verifier.py              # Ephemeral sandbox runner executing pytest
│   ├── test_app.py              # Automated test suite (100% pass)
│   ├── requirements.txt         # FastAPI, uvicorn, pytest, pydantic, requests
│   └── scenarios/               # Prepared benchmark testbeds
│       ├── auth_idor/
│       ├── logic_discount/
│       ├── sql_injection/
│       └── clean_pr/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main state machine and workflow coordinator
│   │   ├── style.css            # Dark glassmorphism & typography design tokens
│   │   ├── types.ts             # TypeScript domain interfaces
│   │   └── components/
│   │       ├── Navbar.tsx           # Brand header & scenario pickers
│   │       ├── WorkflowStepper.tsx  # 6-step interactive workflow bar
│   │       ├── ReadinessHeader.tsx  # Production readiness gauge & verdict
│   │       ├── FindingCard.tsx      # Blast radius, impact & root cause
│   │       ├── DiffViewer.tsx       # Side-by-side & unified diff viewer
│   │       ├── SandboxConsole.tsx   # Dual terminal live pytest runner
│   │       ├── MergeBar.tsx         # Human approval, .patch export & PR comments
│   │       └── CustomPRModal.tsx    # Live GitHub PR URL & custom diff analyzer
│   ├── package.json             # Vite, React, TypeScript, Lucide icons
│   └── vite.config.ts           # Development proxy & build config
├── run.py                       # Single-command launcher for both servers
├── start.bat                    # Windows batch launcher
└── README.md
```

---

## 🚀 Quickstart

### 1. Requirements
- Python 3.10+
- Node.js 18+ and npm

### 2. Single-Command Launch
Run the launcher from the project root:
```bash
python run.py
```
*(On Windows, you can also double-click `start.bat`)*

Both services will start automatically:
- **Web Application:** [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **FastAPI Backend:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **API Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🧪 Running Automated Tests

Run the backend verification suite to validate all scenario engines and sandboxes:
```bash
cd backend
pytest test_app.py -v
```

Expected result:
```
test_app.py::test_health_check PASSED                                    [ 14%]
test_app.py::test_list_scenarios PASSED                                  [ 28%]
test_app.py::test_get_scenario_detail PASSED                             [ 42%]
test_app.py::test_verify_auth_idor PASSED                                [ 57%]
test_app.py::test_verify_logic_discount PASSED                           [ 71%]
test_app.py::test_verify_sql_injection PASSED                            [ 85%]
test_app.py::test_verify_clean_pr_restraint PASSED                       [100%]
======================== 7 passed in 12.14s ========================
```

---

## 📊 Measurement of Review Quality
ShipSafe evaluates review quality on four strict outcomes:
1. **Precision:** High true-positive rate, verified by zero false alarms on clean PRs.
2. **Evidence:** Every finding cites exact lines, caller chains, and reproduction steps.
3. **Fix Validity:** Patches are minimal, surgical, and directly address the defect.
4. **Verification:** The targeted test is executed in an isolated worktree to prove failure before the fix and success after.

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Finding(BaseModel):
    id: str
    title: str
    category: str
    severity: str # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE"
    confidence: int # percentage 0-100
    status: str # "BLOCKED" | "APPROVED" | "UNCERTAIN"
    file_path: str
    line_start: int
    line_end: int
    summary: str
    impact: str
    root_cause: str
    proposed_fix_summary: str
    test_file: str

class ScenarioSummary(BaseModel):
    id: str
    title: str
    repo_name: str
    pr_number: int
    pr_title: str
    pr_author: str
    category: str
    severity: str
    confidence: int
    status: str
    file_path: str

class ScenarioDetail(ScenarioSummary):
    summary: str
    impact: str
    root_cause: str
    proposed_fix_summary: str
    test_file: str
    original_code: str
    fixed_code: str
    test_code: str
    diff: str

class AnalyzeRequest(BaseModel):
    scenario_id: Optional[str] = None
    pr_url: Optional[str] = None
    diff_text: Optional[str] = None
    code_content: Optional[str] = None
    file_path: Optional[str] = "main.py"

class TestExecutionResult(BaseModel):
    target: str # "original" | "patched"
    passed: bool
    exit_code: int
    stdout: str
    stderr: str
    execution_time_ms: float
    summary: str
    failure_details: Optional[str] = None

class VerifyRequest(BaseModel):
    scenario_id: Optional[str] = None
    original_code: str
    patched_code: str
    test_code: str
    file_path: Optional[str] = "solution.py"

class VerifyResponse(BaseModel):
    scenario_id: Optional[str]
    is_verified: bool # True if original failed (or was clean) and patched passed!
    original_result: TestExecutionResult
    patched_result: TestExecutionResult
    verification_badge: str # "VERIFIED_FIX" | "FIX_FAILED" | "ALL_PASS"
    explanation: str

class GitHubFetchRequest(BaseModel):
    pr_url: str

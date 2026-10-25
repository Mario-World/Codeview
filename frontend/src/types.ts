export interface ScenarioSummary {
  id: string;
  title: string;
  repo_name: string;
  pr_number: number;
  pr_title: string;
  pr_author: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  confidence: number;
  status: "BLOCKED" | "APPROVED" | "UNCERTAIN";
  file_path: string;
}

export interface ScenarioDetail extends ScenarioSummary {
  summary: string;
  impact: string;
  root_cause: string;
  proposed_fix_summary: string;
  test_file: string;
  original_code: string;
  fixed_code: string;
  test_code: string;
  diff: string;
}

export interface TestExecutionResult {
  target: "original" | "patched";
  passed: boolean;
  exit_code: number;
  stdout: string;
  stderr: string;
  execution_time_ms: number;
  summary: string;
  failure_details?: string;
}

export interface VerifyResponse {
  scenario_id?: string;
  is_verified: boolean;
  original_result: TestExecutionResult;
  patched_result: TestExecutionResult;
  verification_badge: "VERIFIED_FIX" | "FIX_FAILED" | "ALL_PASS" | "UNCERTAIN";
  explanation: string;
}

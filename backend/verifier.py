import sys
import os
import time
import tempfile
import subprocess
import re
from typing import Tuple
from models import TestExecutionResult, VerifyResponse

def _run_pytest_in_sandbox(code_content: str, test_content: str, target_name: str) -> TestExecutionResult:
    start_time = time.time()
    with tempfile.TemporaryDirectory() as temp_dir:
        solution_path = os.path.join(temp_dir, "solution.py")
        test_path = os.path.join(temp_dir, "test_target.py")

        with open(solution_path, "w", encoding="utf-8") as f:
            f.write(code_content)

        with open(test_path, "w", encoding="utf-8") as f:
            f.write(test_content)

        cmd = [sys.executable, "-m", "pytest", "test_target.py", "-v", "--tb=short", "--no-header"]
        
        try:
            proc = subprocess.run(
                cmd,
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=10,
                env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"}
            )
            elapsed_ms = (time.time() - start_time) * 1000.0
            passed = (proc.returncode == 0)
            stdout = proc.stdout or ""
            stderr = proc.stderr or ""

            # Extract failure line if failed
            failure_details = None
            if not passed:
                match = re.search(r"(FAILED [^\n]+)", stdout)
                if match:
                    failure_details = match.group(1)
                assertion_match = re.search(r"(AssertionError:[^\n]+)", stdout)
                if assertion_match:
                    failure_details = (failure_details + " | " + assertion_match.group(1)) if failure_details else assertion_match.group(1)
                if not failure_details and "Exception" in stdout:
                    failure_details = "Exception occurred during execution"

            # Clean readable summary
            summary = "All tests passed successfully (Exit Code 0)" if passed else f"Targeted check failed (Exit Code {proc.returncode})"

            return TestExecutionResult(
                target=target_name,
                passed=passed,
                exit_code=proc.returncode,
                stdout=stdout,
                stderr=stderr,
                execution_time_ms=round(elapsed_ms, 2),
                summary=summary,
                failure_details=failure_details
            )

        except subprocess.TimeoutExpired:
            elapsed_ms = (time.time() - start_time) * 1000.0
            return TestExecutionResult(
                target=target_name,
                passed=False,
                exit_code=124,
                stdout="",
                stderr="Test execution exceeded sandbox timeout (10s limit). Potential infinite loop.",
                execution_time_ms=round(elapsed_ms, 2),
                summary="Execution Timed Out",
                failure_details="TimeoutExpired: > 10.0s"
            )
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000.0
            return TestExecutionResult(
                target=target_name,
                passed=False,
                exit_code=-1,
                stdout="",
                stderr=str(e),
                execution_time_ms=round(elapsed_ms, 2),
                summary="Execution Error in Test Sandbox",
                failure_details=str(e)
            )

def execute_verification(original_code: str, patched_code: str, test_code: str, scenario_id: str = None) -> VerifyResponse:
    # 1. Run against original code
    orig_res = _run_pytest_in_sandbox(original_code, test_code, "original")

    # 2. Run against patched code
    patched_res = _run_pytest_in_sandbox(patched_code, test_code, "patched")

    # Determine verification status
    if not orig_res.passed and patched_res.passed:
        is_verified = True
        badge = "VERIFIED_FIX"
        explanation = "Defect successfully reproduced on original code and confirmed resolved with 100% test pass on patched code."
    elif orig_res.passed and patched_res.passed:
        is_verified = True
        badge = "ALL_PASS"
        explanation = "Both original and candidate pass all regression suites. No regressions or invariant violations detected."
    elif not patched_res.passed:
        is_verified = False
        badge = "FIX_FAILED"
        explanation = "Candidate patch failed to satisfy the targeted verification test. Further revision required."
    else:
        is_verified = False
        badge = "UNCERTAIN"
        explanation = "Original code unexpectedly passed but patch failed."

    return VerifyResponse(
        scenario_id=scenario_id,
        is_verified=is_verified,
        original_result=orig_res,
        patched_result=patched_res,
        verification_badge=badge,
        explanation=explanation
    )

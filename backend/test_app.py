import pytest
from fastapi.testclient import TestClient
from main import app
from analyzer import list_all_scenarios, get_scenario_detail
from verifier import execute_verification

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ShipSafe" in data["service"]

def test_list_scenarios():
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) >= 5
    scenario_ids = [s["id"] for s in scenarios]
    assert "auth_idor" in scenario_ids
    assert "ts_jwt_auth" in scenario_ids
    assert "logic_discount" in scenario_ids
    assert "sql_injection" in scenario_ids
    assert "clean_pr" in scenario_ids

def test_get_scenario_detail_python():
    response = client.get("/api/scenarios/auth_idor")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "auth_idor"
    assert data["severity"] == "CRITICAL"
    assert data["language"] == "python"
    assert len(data["unresolved_risks"]) > 0

def test_get_scenario_detail_typescript():
    response = client.get("/api/scenarios/ts_jwt_auth")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "ts_jwt_auth"
    assert data["severity"] == "CRITICAL"
    assert data["language"] == "typescript"
    assert "verifyJwt" in data["fixed_code"]

def test_verify_auth_idor_and_report():
    detail = get_scenario_detail("auth_idor")
    assert detail is not None
    result = execute_verification(
        original_code=detail.original_code,
        patched_code=detail.fixed_code,
        test_code=detail.test_code,
        scenario_id="auth_idor",
        language="python",
        unresolved_risks=detail.unresolved_risks
    )
    assert result.original_result.passed is False
    assert result.patched_result.passed is True
    assert result.is_verified is True
    assert result.verification_badge == "VERIFIED_FIX"
    # Verification report fields
    assert len(result.what_passed) >= 1
    assert len(result.what_failed) >= 1
    assert len(result.what_uncertain) >= 1

def test_verify_typescript_jwt_auth():
    detail = get_scenario_detail("ts_jwt_auth")
    assert detail is not None
    result = execute_verification(
        original_code=detail.original_code,
        patched_code=detail.fixed_code,
        test_code=detail.test_code,
        scenario_id="ts_jwt_auth",
        language="typescript",
        unresolved_risks=detail.unresolved_risks
    )
    assert result.original_result.passed is False
    assert result.patched_result.passed is True
    assert result.is_verified is True
    assert len(result.what_passed) >= 1
    assert len(result.what_failed) >= 1
    assert len(result.what_uncertain) >= 1

def test_verify_clean_pr_restraint():
    detail = get_scenario_detail("clean_pr")
    assert detail is not None
    result = execute_verification(
        original_code=detail.original_code,
        patched_code=detail.fixed_code,
        test_code=detail.test_code,
        scenario_id="clean_pr",
        language="python"
    )
    assert result.original_result.passed is True
    assert result.patched_result.passed is True
    assert result.is_verified is True
    assert result.verification_badge == "ALL_PASS"

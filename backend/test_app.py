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
    assert len(scenarios) >= 4
    scenario_ids = [s["id"] for s in scenarios]
    assert "auth_idor" in scenario_ids
    assert "logic_discount" in scenario_ids
    assert "sql_injection" in scenario_ids
    assert "clean_pr" in scenario_ids

def test_get_scenario_detail():
    response = client.get("/api/scenarios/auth_idor")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "auth_idor"
    assert data["severity"] == "CRITICAL"
    assert "org_id" in data["fixed_code"]
    assert "test_cross_tenant_deletion_is_forbidden" in data["test_code"]

def test_verify_auth_idor():
    detail = get_scenario_detail("auth_idor")
    assert detail is not None
    result = execute_verification(
        original_code=detail.original_code,
        patched_code=detail.fixed_code,
        test_code=detail.test_code,
        scenario_id="auth_idor"
    )
    # Original should fail security test, patch should pass!
    assert result.original_result.passed is False
    assert result.patched_result.passed is True
    assert result.is_verified is True
    assert result.verification_badge == "VERIFIED_FIX"

def test_verify_logic_discount():
    detail = get_scenario_detail("logic_discount")
    assert detail is not None
    result = execute_verification(
        original_code=detail.original_code,
        patched_code=detail.fixed_code,
        test_code=detail.test_code,
        scenario_id="logic_discount"
    )
    assert result.original_result.passed is False
    assert result.patched_result.passed is True
    assert result.is_verified is True
    assert result.verification_badge == "VERIFIED_FIX"

def test_verify_sql_injection():
    detail = get_scenario_detail("sql_injection")
    assert detail is not None
    result = execute_verification(
        original_code=detail.original_code,
        patched_code=detail.fixed_code,
        test_code=detail.test_code,
        scenario_id="sql_injection"
    )
    assert result.original_result.passed is False
    assert result.patched_result.passed is True
    assert result.is_verified is True
    assert result.verification_badge == "VERIFIED_FIX"

def test_verify_clean_pr_restraint():
    detail = get_scenario_detail("clean_pr")
    assert detail is not None
    result = execute_verification(
        original_code=detail.original_code,
        patched_code=detail.fixed_code,
        test_code=detail.test_code,
        scenario_id="clean_pr"
    )
    # Clean PR passes both times, demonstrating restraint
    assert result.original_result.passed is True
    assert result.patched_result.passed is True
    assert result.is_verified is True
    assert result.verification_badge == "ALL_PASS"

import pytest

def test_sql_injection_tenant_isolation():
    """
    SECURITY TEST: CWE-89 SQL Injection attack resistance.
    A malicious search term attempting an SQL injection breakout
    must NEVER return records belonging to another tenant!
    """
    from solution import find_tenant_users

    # Attacker crafts classic OR 1=1 injection payload
    malicious_payload = "admin' OR '1'='1"
    results = find_tenant_users("tenant_alpha", malicious_payload)

    # Verify no records from tenant_beta are leaked
    leaked_tenants = {u["tenant_id"] for u in results if u["tenant_id"] != "tenant_alpha"}
    assert len(leaked_tenants) == 0, f"Critical SQL Injection vulnerability! Leaked other tenant records: {leaked_tenants}"

def test_normal_search_accuracy():
    """
    FUNCTIONAL TEST: Normal search within legitimate tenant boundaries works as expected.
    """
    from solution import find_tenant_users

    results = find_tenant_users("tenant_alpha", "alice")
    assert len(results) == 1
    assert results[0]["username"] == "alice"
    assert results[0]["tenant_id"] == "tenant_alpha"

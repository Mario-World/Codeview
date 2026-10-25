import pytest
import copy

def test_cross_tenant_deletion_is_forbidden():
    """
    SECURITY TEST: Insecure Direct Object Reference (IDOR) & Multi-tenancy check.
    User B (org_beta) must NEVER be allowed to delete invoice belonging to User A (org_alpha).
    """
    from solution import delete_invoice, User, INVOICES_DB, HTTPException

    # Reset test database state
    original_db = copy.deepcopy(INVOICES_DB)
    try:
        attacker_user = User(id="usr_attacker_99", username="mallory", org_id="org_beta")
        target_invoice_id = "inv_101" # Owned by org_alpha

        # Check precondition: inv_101 belongs to org_alpha
        assert INVOICES_DB[target_invoice_id].org_id == "org_alpha"

        # Attempt unauthorized cross-tenant deletion
        with pytest.raises(HTTPException) as exc_info:
            delete_invoice(target_invoice_id, attacker_user)

        # Must strictly raise 403 Forbidden
        assert exc_info.value.status_code == 403, f"Expected 403 Forbidden, but received {exc_info.value.status_code}"
        assert target_invoice_id in INVOICES_DB, "Security failure: Invoice was deleted by cross-tenant attacker!"
    finally:
        INVOICES_DB.clear()
        INVOICES_DB.update(original_db)

def test_authorized_owner_can_delete():
    """
    FUNCTIONAL TEST: Legitimate organization member should be able to delete their own invoice.
    """
    from solution import delete_invoice, User, INVOICES_DB, HTTPException

    original_db = copy.deepcopy(INVOICES_DB)
    try:
        legit_user = User(id="usr_admin_01", username="alice", org_id="org_alpha")
        result = delete_invoice("inv_101", legit_user)
        assert result["status"] == "deleted"
        assert "inv_101" not in INVOICES_DB
    finally:
        INVOICES_DB.clear()
        INVOICES_DB.update(original_db)

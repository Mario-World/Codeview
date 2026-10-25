# Verified Patched Code (Production Ready)
from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: str
    username: str
    org_id: str

class Invoice(BaseModel):
    id: str
    org_id: str
    amount: float
    description: str

INVOICES_DB = {
    "inv_101": Invoice(id="inv_101", org_id="org_alpha", amount=12500.0, description="Enterprise Cloud License"),
    "inv_102": Invoice(id="inv_102", org_id="org_beta", amount=450.0, description="Monthly Subscription"),
}

class HTTPException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"{status_code}: {detail}")

def delete_invoice(invoice_id: str, current_user: User) -> dict:
    """
    AI-Generated delete invoice endpoint handler.
    FIXED: Added tenant boundary authorization check.
    Cross-tenant invoice access is strictly denied with 403 Forbidden.
    """
    invoice = INVOICES_DB.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # FIX: Verify organization ownership before granting deletion
    if invoice.org_id != current_user.org_id:
        raise HTTPException(
            status_code=403, 
            detail=f"Forbidden: User {current_user.id} ({current_user.org_id}) cannot delete invoice belonging to {invoice.org_id}"
        )

    del INVOICES_DB[invoice_id]
    return {"status": "deleted", "invoice_id": invoice_id}

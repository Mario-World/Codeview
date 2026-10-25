from pydantic import BaseModel
from typing import List, Optional

class CartItem(BaseModel):
    sku: str
    name: str
    unit_price: float
    quantity: int

class Cart(BaseModel):
    items: List[CartItem]
    coupon_code: Optional[str] = None
    is_vip_member: bool = False

def calculate_final_charge(cart: Cart) -> dict:
    """
    AI-Generated pricing engine.
    DEFECT: Missing zero-floor check and discount capping.
    When a customer with VIP status purchases an item lower than the VIP credit ($30),
    the final charge becomes negative, effectively giving the user an unbacked store balance!
    """
    subtotal = sum(item.unit_price * item.quantity for item in cart.items)
    discount = 0.0

    if cart.coupon_code == "SAVE50":
        discount += subtotal * 0.50

    if cart.is_vip_member:
        discount += 30.0

    # BUG: Fails to bound discount <= subtotal
    total = subtotal - discount

    return {
        "subtotal": round(subtotal, 2),
        "discount": round(discount, 2),
        "total_charged": round(total, 2)
    }

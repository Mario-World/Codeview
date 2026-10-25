import pytest

def test_negative_charge_prevention():
    """
    BUSINESS LOGIC TEST: Ensure order charges can never be negative.
    A VIP customer ordering a $15 item with $30 VIP discount should be charged $0.00,
    NOT -$15.00!
    """
    from solution import CartItem, Cart, calculate_final_charge

    cart = Cart(
        items=[CartItem(sku="SKU-BOOK-01", name="Pocket Notebook", unit_price=15.0, quantity=1)],
        is_vip_member=True
    )
    result = calculate_final_charge(cart)

    assert result["subtotal"] == 15.0
    assert result["total_charged"] >= 0.0, f"Critical logic flaw: order total is negative ({result['total_charged']} USD)!"
    assert result["total_charged"] == 0.0
    assert result["discount"] <= result["subtotal"]

def test_standard_discount_calculation():
    """
    FUNCTIONAL TEST: Standard coupon code discount works accurately on valid cart.
    """
    from solution import CartItem, Cart, calculate_final_charge

    cart = Cart(
        items=[CartItem(sku="SKU-HOODIE", name="Developer Hoodie", unit_price=60.0, quantity=2)],
        coupon_code="SAVE50"
    )
    result = calculate_final_charge(cart)

    assert result["subtotal"] == 120.0
    assert result["discount"] == 60.0
    assert result["total_charged"] == 60.0

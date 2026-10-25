import time
import pytest

def test_rate_limiter_allows_under_capacity():
    """
    VERIFICATION: Requests within normal capacity must be permitted.
    """
    from solution import RateLimiter

    limiter = RateLimiter(capacity=5, refill_rate_per_sec=1.0)
    client_id = "client_alpha"

    # Consume 3 tokens
    assert limiter.is_allowed(client_id, 1) is True
    assert limiter.is_allowed(client_id, 1) is True
    assert limiter.is_allowed(client_id, 1) is True

def test_rate_limiter_rejects_exceeding():
    """
    VERIFICATION: Requests exceeding bucket capacity must be rejected.
    """
    from solution import RateLimiter

    limiter = RateLimiter(capacity=2, refill_rate_per_sec=0.1)
    client_id = "client_beta"

    assert limiter.is_allowed(client_id, 1) is True
    assert limiter.is_allowed(client_id, 1) is True
    # Bucket exhausted
    assert limiter.is_allowed(client_id, 1) is False

import time
from typing import Dict, Tuple

class RateLimiter:
    """
    Production-ready Token Bucket rate limiter.
    Implements proper time-delta refill, boundary validation, and strict isolation.
    """
    def __init__(self, capacity: int = 10, refill_rate_per_sec: float = 2.0):
        if capacity <= 0 or refill_rate_per_sec <= 0:
            raise ValueError("Capacity and refill rate must be positive numbers")
        self.capacity = capacity
        self.refill_rate = refill_rate_per_sec
        self.buckets: Dict[str, Tuple[float, float]] = {} # key -> (tokens, last_update)

    def is_allowed(self, client_id: str, tokens_requested: int = 1) -> bool:
        if tokens_requested <= 0:
            return False

        now = time.time()
        tokens, last_time = self.buckets.get(client_id, (self.capacity, now))

        # Calculate refilled tokens
        elapsed = max(0.0, now - last_time)
        tokens = min(float(self.capacity), tokens + elapsed * self.refill_rate)

        if tokens >= tokens_requested:
            tokens -= tokens_requested
            self.buckets[client_id] = (tokens, now)
            return True
        else:
            self.buckets[client_id] = (tokens, now)
            return False

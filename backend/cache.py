"""small in-memory ttl cache for hot read endpoints.

tags barely change but are requested on every page load, so a 60 second
cache removes most of that query noise. entries expire lazily on read
and can be invalidated early by prefix (for example "tags:").
"""

import time
from threading import RLock

_store = {}
_lock = RLock()

def cache_get(key: str):
    with _lock:
        entry = _store.get(key)
        if entry is None:
            return None
        value, expires_at = entry
        if time.monotonic() > expires_at:
            _store.pop(key, None)
            return None
        return value

def cache_set(key: str, value, ttl_seconds: float) -> None:
    with _lock:
        _store[key] = (value, time.monotonic() + ttl_seconds)

def invalidate(prefix: str) -> None:
    with _lock:
        for key in [k for k in _store if k.startswith(prefix)]:
            _store.pop(key, None)

def clear() -> None:
    with _lock:
        _store.clear()

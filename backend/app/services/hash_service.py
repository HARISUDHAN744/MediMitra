import hashlib

def calculate_sha256(file_bytes: bytes) -> str:
    """
    Computes a deterministic SHA-256 hexadecimal hash string for the given file bytes.
    Used for duplicate detection and caching extracted document results.
    """
    hasher = hashlib.sha256()
    hasher.update(file_bytes)
    return hasher.hexdigest()

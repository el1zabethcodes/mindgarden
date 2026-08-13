import bcrypt

# passwords are stored as bcrypt digests with a per-user salt.
# we talk to bcrypt directly instead of passlib to avoid the
# unmaintained-wrapper warning on bcrypt >= 4.x

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        # malformed stored hash should never grant access
        return False

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Return a bcrypt hash for the provided password."""
    return pwd_context.hash(password)

if __name__ == "__main__":
    # small CLI helper for developers
    print(hash_password("Secret123!"))
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return print(pwd_context.hash(password))

hash_password("Xv9!pQz@72Lm") 
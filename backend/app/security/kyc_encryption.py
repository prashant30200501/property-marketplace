from cryptography.fernet import Fernet

from app.config import settings


_cipher = Fernet(settings.kyc_encryption_key.encode())


def encrypt_kyc_document(data: bytes) -> bytes:
    return _cipher.encrypt(data)


def decrypt_kyc_document(data: bytes) -> bytes:
    return _cipher.decrypt(data)

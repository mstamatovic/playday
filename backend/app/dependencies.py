from fastapi import Header, HTTPException, status
from app.config import settings

def require_superadmin(x_superadmin_key: str | None = Header(default=None)):
    """
    Dependency funkcija koja proverava da li zahtev sadrži ispravan Superadmin ključ.
    Ako ključ nedostaje ili je pogrešan, vraća 403 Forbidden grešku.
    """
    if not x_superadmin_key or x_superadmin_key != settings.superadmin_secret_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nedovoljne dozvole. Potreban je validan Superadmin ključ."
        )
    return True
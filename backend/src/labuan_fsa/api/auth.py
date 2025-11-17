"""
Authentication API endpoints.

Handles user registration, login, token refresh, and user management.
"""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from labuan_fsa.config import get_settings
from labuan_fsa.database import get_db
from labuan_fsa.models.user import User
from labuan_fsa.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    TokenRefreshRequest,
    TokenRefreshResponse,
    UserResponse,
)
from labuan_fsa.utils.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_token,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

settings = get_settings()


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> RegisterResponse:
    """
    Register a new user.

    Args:
        request: Registration request
        db: Database session

    Returns:
        Registration response

    Raises:
        HTTPException: 409 if email already exists
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == request.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Create user
    user = User(
        email=request.email,
        password_hash=get_password_hash(request.password),
        full_name=request.full_name,
        phone_number=request.phone_number,
        role="user",
        is_active=True,
        is_verified=False,  # TODO: Implement email verification
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    # TODO: Send verification email

    return RegisterResponse(message="User registered successfully", user_id=user.id)


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    """
    Login user and return JWT tokens.

    Args:
        request: Login request
        db: Database session

    Returns:
        Login response with access and refresh tokens

    Raises:
        HTTPException: 401 if credentials invalid
    """
    # Get user
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Check if user is active
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is disabled")

    # Update last login
    user.last_login_at = datetime.now()
    await db.commit()

    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.security.access_token_expire_minutes * 60,
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(
    request: TokenRefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenRefreshResponse:
    """
    Refresh access token using refresh token.

    Args:
        request: Token refresh request
        db: Database session

    Returns:
        New access token

    Raises:
        HTTPException: 401 if refresh token invalid
    """
    # Verify refresh token
    payload = verify_token(request.refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Get user
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    # Create new access token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )

    return TokenRefreshResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.security.access_token_expire_minutes * 60,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    token: str = Depends(lambda: None),  # TODO: Implement token dependency
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Get current user information.

    Args:
        token: JWT token (from Authorization header)
        db: Database session

    Returns:
        Current user information

    Raises:
        HTTPException: 401 if token invalid
    """
    # TODO: Implement token extraction from Authorization header
    # TODO: Verify token and get user
    raise HTTPException(status_code=501, detail="Get current user not yet implemented")


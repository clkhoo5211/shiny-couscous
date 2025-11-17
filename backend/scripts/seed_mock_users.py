#!/usr/bin/env python3
"""
Seed script to create mock users for local development.

Creates:
- Mock Admin: admin / admin123
- Mock User: user / user123
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from labuan_fsa.database import AsyncSessionLocal, init_db
from labuan_fsa.models.user import User
from labuan_fsa.utils.security import get_password_hash


async def create_mock_users():
    """Create mock users for local development."""
    print("🔧 Initializing database...")
    await init_db()

    print("👤 Creating mock users...")

    async with AsyncSessionLocal() as session:
        # Check if users already exist
        result = await session.execute(select(User))
        existing_users = result.scalars().all()

        # Mock Admin User
        admin_email = "admin@labuanfsa.gov.my"
        admin_exists = any(user.email == admin_email for user in existing_users)

        if not admin_exists:
            admin = User(
                email=admin_email,
                password_hash=get_password_hash("admin123"),
                full_name="Mock Admin",
                phone_number="+60123456789",
                role="admin",
                is_active=True,
                is_verified=True,
            )
            session.add(admin)
            print(f"✅ Created admin user: {admin_email} / admin123")
        else:
            print(f"ℹ️  Admin user already exists: {admin_email}")

        # Mock Regular User
        user_email = "user@example.com"
        user_exists = any(user.email == user_email for user in existing_users)

        if not user_exists:
            regular_user = User(
                email=user_email,
                password_hash=get_password_hash("user123"),
                full_name="Mock User",
                phone_number="+60123456790",
                role="user",
                is_active=True,
                is_verified=True,
            )
            session.add(regular_user)
            print(f"✅ Created regular user: {user_email} / user123")
        else:
            print(f"ℹ️  Regular user already exists: {user_email}")

        await session.commit()
        print("✨ Mock users setup complete!")


if __name__ == "__main__":
    asyncio.run(create_mock_users())


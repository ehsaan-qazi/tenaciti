"""Test configuration and fixtures for backend tests."""

import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db, Base
from app.middleware.rate_limit import limiter


# Use file-based SQLite for testing (shared across connections)
import tempfile
import os

# Create a temporary file for the test database
_test_db_fd, _test_db_path = tempfile.mkstemp(suffix='.db', prefix='test_tenaciti_')
os.close(_test_db_fd)
TEST_DATABASE_URL = f"sqlite+aiosqlite:///{_test_db_path}"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """Create a test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session_factory(test_engine):
    """Create a test database session factory."""
    async_session = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    yield async_session


@pytest_asyncio.fixture(scope="function")
async def db_session(db_session_factory) -> AsyncSession:
    """Create a test database session."""
    async with db_session_factory() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def async_client(db_session_factory):
    """Create an async test client with overridden database dependency."""

    async def override_get_db():
        async with db_session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    # Disable rate limiting for tests
    limiter.enabled = False

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
    # Re-enable rate limiting after tests
    limiter.enabled = True
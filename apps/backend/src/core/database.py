"""
Database Configuration.

This file configures the database connection using SQLAlchemy
and integrates it with FastAPI for asynchronous database operations.

Author : Coke
Date   : 2025-03-17
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Any, AsyncIterator, Iterator

from redis.asyncio import ConnectionPool, Redis
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.config import settings

logger = logging.getLogger(__name__)
ASYNC_DATABASE_URL = str(settings.ASYNC_DATABASE_POSTGRESQL_URL)
SYNC_DATABASE_URL = str(settings.SYNC_DATABASE_POSTGRESQL_URL)
REDIS_URL = str(settings.REDIS_URL)

# Create an 'async and sync' SQLAlchemy engine for PostgreSQL connection.
# The 'echo' parameter is set based on the environment debug flag,
# and 'pool_recycle' ensures that database connections are recycled after 60 seconds.
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=settings.ENVIRONMENT.is_debug, pool_recycle=60)
sync_engine = create_engine(SYNC_DATABASE_URL, echo=settings.ENVIRONMENT.is_debug, pool_recycle=60)

# AsyncSessionLocal is the session maker used to create AsyncSession instances.
# 'expire_on_commit=False' prevents SQLAlchemy from automatically expiring objects after commit.
AsyncSessionLocal = async_sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)
SyncSessionLocal = sessionmaker(sync_engine, class_=Session, expire_on_commit=False)


async def get_async_session() -> AsyncIterator[AsyncSession]:
    """
    Provides an asynchronous database session.

    This function yields a SQLAlchemy AsyncSession object using an async context manager.
    Typically used as a dependency in FastAPI routes with asynchronous handlers.

    Yields:
        AsyncSession: An asynchronous SQLAlchemy session instance.
    """
    async with AsyncSessionLocal() as session:
        yield session


def get_sync_session() -> Iterator[Session]:
    """
    Provides a synchronous database session.

    This function yields a SQLAlchemy Session object using a standard context manager.
    Suitable for synchronous interfaces or tasks that require database access.

    Yields:
        Session: A synchronous SQLAlchemy session instance.
    """
    with SyncSessionLocal() as session:
        yield session


class BaseManager(ABC):
    """
    Abstract base class for resource managers.

    Defines a common interface for connecting to, disconnecting from,
    and accessing resource clients (e.g., database, Redis).
    Subclasses must implement the actual logic.
    """

    @classmethod
    @abstractmethod
    def connect(cls) -> Any:
        """
        Establish a connection to the resource.

        Should be implemented by subclasses to handle specific connection logic.
        """
        ...

    @classmethod
    @abstractmethod
    def disconnect(cls) -> Any:
        """
        Disconnect from the resource.

        Should be implemented by subclasses to cleanly close the connection and release any associated resources.
        """
        ...

    @classmethod
    @abstractmethod
    def client(cls) -> Any:
        """
        Return the connected client instance.

        Should be implemented by subclasses to provide the connected client for further operations.
        """
        ...


class RedisManager(BaseManager):
    """
    A class to manage Redis connection pool and client.

    This class is responsible for initializing and managing a Redis connection pool,
    providing a Redis client, and ensuring only one instance of the connection pool
    and client is used throughout the application.
    """

    _pools: dict[str, ConnectionPool] = {}
    _clients: dict[str, Redis] = {}

    @classmethod
    def connect(
        cls, *, redis_url: str | None = None, pool_name: str = "default", max_connections: int | None = None
    ) -> ConnectionPool:
        """
        Initializes the Redis connection pool if it has not been initialized yet.

        Returns:
            ConnectionPool: The initialized Redis connection pool.

        Raises:
            RuntimeError: If Redis connection fails.
        """
        redis_url = redis_url or REDIS_URL
        max_connections = max_connections or settings.REDIS_MAX_CONNECTIONS
        if pool_name not in cls._pools:
            pool = ConnectionPool.from_url(redis_url, max_connections=max_connections, decode_responses=True)
            cls._pools[pool_name] = pool
            cls._clients[pool_name] = Redis(connection_pool=pool)
            logger.info(f'Redis connection pool for "{pool_name}" initialization completed.')

        return cls._pools[pool_name]

    @classmethod
    async def disconnect(cls, pool_name: str = "default") -> None:
        """Closes the Redis connection pool and client."""
        if pool_name in cls._pools:
            await cls._pools[pool_name].disconnect()
            logger.info(f'Redis connection pool for "{pool_name}" disconnect completed.')
            del cls._pools[pool_name]
            del cls._clients[pool_name]

    @classmethod
    async def clear(cls) -> None:
        """Clears the Redis connection pool and client."""
        if cls._clients:
            await asyncio.gather(*(pool.disconnect() for pool in cls._pools.values()))
            cls._pools.clear()
            cls._clients.clear()

    @classmethod
    def client(cls, pool_name: str = "default") -> Redis:
        """
        Returns the initialized Redis client.

        This method retrieves the Redis client if it has been initialized. Raises an
        exception if the client has not been set up yet.

        Returns:
            Redis: The initialized Redis client.

        Raises:
            RuntimeError: If the Redis client is not initialized.
        """
        if pool_name not in cls._clients:
            raise RuntimeError(f'Redis client for pool "{pool_name}" not initialized.')
        return cls._clients[pool_name]

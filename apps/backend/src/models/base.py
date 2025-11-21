"""
Database Model Base Class with Timestamp Support.

Author : Coke
Date   : 2025-03-24
"""

from datetime import datetime
from uuid import UUID

from sqlmodel import Field
from sqlmodel import SQLModel as _SQLModel

from src.utils.uuid7 import uuid7


class SQLModel(_SQLModel):
    """
    Base SQLModel class that combines Pydantic and SQLAlchemy functionality.

    Inherits from both BaseModel (custom Pydantic model) and SQLModel (SQLAlchemy model).
    Provides common fields and serialization for database models.
    """

    id: UUID = Field(
        default_factory=uuid7,
        primary_key=True,
        index=True,
        nullable=False,
        description="Unique ID",
    )
    create_time: datetime = Field(default_factory=datetime.now, description="Creation time")
    update_time: datetime = Field(
        default_factory=datetime.now,
        sa_column_kwargs={"onupdate": datetime.now},
        description="Update time",
    )

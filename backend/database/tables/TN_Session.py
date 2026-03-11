from sqlalchemy import (
    Integer,
    Text,
    DateTime,
    String,
    Enum as SAEnum,
    func,
    JSON,
)
from sqlalchemy.schema import UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
import enum
import uuid
# Mine
from .Base import BASE
from sqlalchemy import UUID
class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"

class TN_Session(BASE):
    __tablename__ = 'TN_Session'
    
    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    # 標題
    title: Mapped[str] = mapped_column(String(255), nullable=False)
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

class TN_Messages(BASE):
    __tablename__ = 'TN_Messages'
    
    # Primary Key
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    # session_id 改用 String 儲存 UUID
    session_id: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
        doc="對話識別碼，儲存 uuid.uuid4().hex 或 str(uuid4())"
    )
    # 保證同一 session 裡順序唯一
    turn_ordinal: Mapped[int] = mapped_column(
        Integer, nullable=False, doc="訊息在 session 裡的順序，從 1 開始"
    )
    # 角色欄位：user 或 assistant
    role: Mapped[MessageRole] = mapped_column(
        SAEnum(MessageRole, name="chat_role", native_enum=False),
        nullable=False
    )
    # 內容
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # 建立時間
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now
    )
from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

DataT = TypeVar("DataT")

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class APIResponse(BaseModel, Generic[DataT]):
    success: bool = True
    data: Optional[DataT] = None
    error: Optional[ErrorDetail] = None

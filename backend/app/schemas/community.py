from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class ForumPostCreateDTO(BaseModel):
    title: str = Field(..., min_length=5, description="Forum discussion topic title")
    category: str = Field(default="কৃষি পরামর্শ", description="Forum category")
    content: str = Field(..., min_length=10, description="Discussion description")

class ForumPostResponseDTO(BaseModel):
    id: int
    user_id: int
    author_name: str
    title: str
    category: str
    content: str
    views_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class TrainingCourseResponseDTO(BaseModel):
    id: int
    title_bn: str
    category: str
    instructor_bn: str
    duration_hours: int
    video_url: Optional[str] = None
    description_bn: str
    created_at: datetime

    class Config:
        from_attributes = True

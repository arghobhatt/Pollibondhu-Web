from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class ForumPostCreateDTO(BaseModel):
    title: str = Field(..., min_length=5, description="Forum discussion topic title")
    category: str = Field(default="কৃষি পরামর্শ", description="Forum category")
    content: str = Field(..., min_length=10, description="Discussion description")

class ForumCommentCreateDTO(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000, description="Comment text")

class ForumCommentResponseDTO(BaseModel):
    id: int
    post_id: int
    user_id: int
    author_name: str
    content: str
    created_at: datetime
    is_author: bool = False
    can_delete: bool = False

    class Config:
        from_attributes = True

class ForumReactionToggleResponseDTO(BaseModel):
    success: bool
    user_reacted: bool
    reactions_count: int

class ForumPostResponseDTO(BaseModel):
    id: int
    user_id: int
    author_name: str
    title: str
    category: str
    content: str
    views_count: int
    reactions_count: int = 0
    comments_count: int = 0
    user_reacted: bool = False
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

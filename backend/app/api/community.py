from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.orm import User
from app.api.deps import get_current_active_user, get_optional_current_user
from app.schemas.community import (
    ForumPostCreateDTO,
    ForumPostResponseDTO,
    ForumCommentCreateDTO,
    ForumCommentResponseDTO,
    ForumReactionToggleResponseDTO,
    TrainingCourseResponseDTO
)
from app.services.community_service import community_service

router = APIRouter(prefix="/api/community", tags=["Community & Training Hub"])

@router.get("/forum/posts", response_model=List[ForumPostResponseDTO])
def get_forum_posts(
    category: Optional[str] = Query(None, description="Forum category filter"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    return community_service.get_forum_posts(db, category, current_user)

@router.post("/forum/posts", response_model=ForumPostResponseDTO, status_code=status.HTTP_201_CREATED)
def create_forum_post(
    req: ForumPostCreateDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return community_service.create_forum_post(db, current_user, req)

@router.post("/forum/posts/{post_id}/react", response_model=ForumReactionToggleResponseDTO)
def toggle_reaction(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return community_service.toggle_reaction(db, post_id, current_user)

@router.get("/forum/posts/{post_id}/comments", response_model=List[ForumCommentResponseDTO])
def get_comments(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    return community_service.get_comments(db, post_id, current_user)

@router.post("/forum/posts/{post_id}/comments", response_model=ForumCommentResponseDTO, status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    req: ForumCommentCreateDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return community_service.create_comment(db, post_id, current_user, req)

@router.delete("/forum/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return community_service.delete_comment(db, comment_id, current_user)

@router.get("/training/courses", response_model=List[TrainingCourseResponseDTO])
def get_training_courses(
    category: Optional[str] = Query(None, description="Course category filter"),
    db: Session = Depends(get_db)
):
    return community_service.get_training_courses(db, category)

@router.get("/training/courses/{course_id}", response_model=TrainingCourseResponseDTO)
def get_course_details(
    course_id: int,
    db: Session = Depends(get_db)
):
    return community_service.get_course_details(db, course_id)


from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.orm import User
from app.api.deps import get_current_active_user
from app.schemas.community import ForumPostCreateDTO, ForumPostResponseDTO, TrainingCourseResponseDTO
from app.services.community_service import community_service

router = APIRouter(prefix="/api/community", tags=["Community & Training Hub"])

@router.get("/forum/posts", response_model=List[ForumPostResponseDTO])
def get_forum_posts(
    category: Optional[str] = Query(None, description="Forum category filter"),
    db: Session = Depends(get_db)
):
    return community_service.get_forum_posts(db, category)

@router.post("/forum/posts", response_model=ForumPostResponseDTO, status_code=status.HTTP_201_CREATED)
def create_forum_post(
    req: ForumPostCreateDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return community_service.create_forum_post(db, current_user, req)

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

from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.orm import User, ForumPost, TrainingCourse
from app.schemas.community import ForumPostCreateDTO, ForumPostResponseDTO, TrainingCourseResponseDTO

class CommunityService:
    def get_forum_posts(self, db: Session, category: Optional[str] = None) -> List[ForumPostResponseDTO]:
        query = db.query(ForumPost)
        if category and category.strip() and category.strip() != "all":
            query = query.filter(ForumPost.category == category.strip())
        posts = query.order_by(ForumPost.created_at.desc()).all()
        return [ForumPostResponseDTO.model_validate(p) for p in posts]

    def create_forum_post(self, db: Session, user: User, req: ForumPostCreateDTO) -> ForumPostResponseDTO:
        post = ForumPost(
            user_id=user.id,
            author_name=user.full_name,
            title=req.title,
            category=req.category,
            content=req.content,
            views_count=0
        )
        db.add(post)
        db.commit()
        db.refresh(post)
        return ForumPostResponseDTO.model_validate(post)

    def get_training_courses(self, db: Session, category: Optional[str] = None) -> List[TrainingCourseResponseDTO]:
        query = db.query(TrainingCourse)
        if category and category.strip() and category.strip() != "all":
            query = query.filter(TrainingCourse.category == category.strip())
        courses = query.order_by(TrainingCourse.created_at.desc()).all()
        return [TrainingCourseResponseDTO.model_validate(c) for c in courses]

    def get_course_details(self, db: Session, course_id: int) -> TrainingCourseResponseDTO:
        course = db.query(TrainingCourse).filter(TrainingCourse.id == course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Training course not found")
        return TrainingCourseResponseDTO.model_validate(course)

community_service = CommunityService()

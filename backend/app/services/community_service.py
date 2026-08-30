from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.orm import User, UserRole, ForumPost, ForumPostReaction, ForumComment, TrainingCourse
from app.schemas.community import (
    ForumPostCreateDTO,
    ForumPostResponseDTO,
    ForumCommentCreateDTO,
    ForumCommentResponseDTO,
    ForumReactionToggleResponseDTO,
    TrainingCourseResponseDTO
)

class CommunityService:
    def get_forum_posts(
        self,
        db: Session,
        category: Optional[str] = None,
        current_user: Optional[User] = None
    ) -> List[ForumPostResponseDTO]:
        query = db.query(ForumPost)
        if category and category.strip() and category.strip() != "all":
            query = query.filter(ForumPost.category == category.strip())
        posts = query.order_by(ForumPost.created_at.desc()).all()

        results = []
        for p in posts:
            rx_count = db.query(ForumPostReaction).filter(ForumPostReaction.post_id == p.id).count()
            cm_count = db.query(ForumComment).filter(ForumComment.post_id == p.id).count()
            user_reacted = False
            if current_user:
                user_reacted = db.query(ForumPostReaction).filter(
                    ForumPostReaction.post_id == p.id,
                    ForumPostReaction.user_id == current_user.id
                ).first() is not None

            results.append(
                ForumPostResponseDTO(
                    id=p.id,
                    user_id=p.user_id,
                    author_name=p.author_name,
                    title=p.title,
                    category=p.category,
                    content=p.content,
                    views_count=p.views_count,
                    reactions_count=rx_count,
                    comments_count=cm_count,
                    user_reacted=user_reacted,
                    created_at=p.created_at
                )
            )
        return results

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
        return ForumPostResponseDTO(
            id=post.id,
            user_id=post.user_id,
            author_name=post.author_name,
            title=post.title,
            category=post.category,
            content=post.content,
            views_count=post.views_count,
            reactions_count=0,
            comments_count=0,
            user_reacted=False,
            created_at=post.created_at
        )

    def toggle_reaction(self, db: Session, post_id: int, user: User) -> ForumReactionToggleResponseDTO:
        post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forum post not found")

        existing_reaction = db.query(ForumPostReaction).filter(
            ForumPostReaction.post_id == post_id,
            ForumPostReaction.user_id == user.id
        ).first()

        if existing_reaction:
            db.delete(existing_reaction)
            db.commit()
            user_reacted = False
        else:
            new_reaction = ForumPostReaction(post_id=post_id, user_id=user.id)
            db.add(new_reaction)
            db.commit()
            user_reacted = True

        total_reactions = db.query(ForumPostReaction).filter(ForumPostReaction.post_id == post_id).count()
        return ForumReactionToggleResponseDTO(
            success=True,
            user_reacted=user_reacted,
            reactions_count=total_reactions
        )

    def get_comments(
        self,
        db: Session,
        post_id: int,
        current_user: Optional[User] = None
    ) -> List[ForumCommentResponseDTO]:
        post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forum post not found")

        comments = db.query(ForumComment).filter(
            ForumComment.post_id == post_id
        ).order_by(ForumComment.created_at.asc()).all()

        results = []
        for c in comments:
            is_author = bool(current_user and current_user.id == c.user_id)
            can_delete = is_author or bool(current_user and current_user.role in (UserRole.OFFICER, UserRole.ADMIN))
            results.append(
                ForumCommentResponseDTO(
                    id=c.id,
                    post_id=c.post_id,
                    user_id=c.user_id,
                    author_name=c.author_name,
                    content=c.content,
                    created_at=c.created_at,
                    is_author=is_author,
                    can_delete=can_delete
                )
            )
        return results

    def create_comment(
        self,
        db: Session,
        post_id: int,
        user: User,
        req: ForumCommentCreateDTO
    ) -> ForumCommentResponseDTO:
        post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Forum post not found")

        cleaned_content = req.content.strip()
        if not cleaned_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="মন্তব্য অবশ্যই লিখতে হবে (Comment text cannot be empty)"
            )

        comment = ForumComment(
            post_id=post_id,
            user_id=user.id,
            author_name=user.full_name,
            content=cleaned_content
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)

        return ForumCommentResponseDTO(
            id=comment.id,
            post_id=comment.post_id,
            user_id=comment.user_id,
            author_name=comment.author_name,
            content=comment.content,
            created_at=comment.created_at,
            is_author=True,
            can_delete=True
        )

    def delete_comment(self, db: Session, comment_id: int, user: User) -> dict:
        comment = db.query(ForumComment).filter(ForumComment.id == comment_id).first()
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

        is_author = (comment.user_id == user.id)
        is_officer = (user.role in (UserRole.OFFICER, UserRole.ADMIN))

        if not (is_author or is_officer):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="আপনি শুধুমাত্র নিজের মন্তব্য মুছে ফেলতে পারবেন (Only comment author or officer can delete)"
            )

        db.delete(comment)
        db.commit()
        return {"status": "success", "message": "মন্তব্যটি সফলভাবে মুছে ফেলা হয়েছে"}

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

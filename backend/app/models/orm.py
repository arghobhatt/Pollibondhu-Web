from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.database import Base

class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    OFFICER = "officer"
    ADMIN = "admin"

class ApplicationStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class ComplaintStatus(str, enum.Enum):
    PENDING = "Pending"
    UNDER_INVESTIGATION = "Under Investigation"
    RESOLVED = "Resolved"
    REJECTED = "Rejected"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(32), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    nid_number = Column(String(64), unique=True, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CITIZEN, nullable=False)
    division = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    upazila = Column(String(100), nullable=True)
    password_hash = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    applications = relationship("ServiceApplication", foreign_keys="ServiceApplication.user_id", back_populates="applicant", cascade="all, delete-orphan", passive_deletes=True)
    assigned_applications = relationship("ServiceApplication", foreign_keys="ServiceApplication.assigned_officer_id", back_populates="assigned_officer")
    loans = relationship("LoanApplication", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    complaints = relationship("CitizenComplaint", foreign_keys="CitizenComplaint.user_id", back_populates="complainant", cascade="all, delete-orphan", passive_deletes=True)
    assigned_complaints = relationship("CitizenComplaint", foreign_keys="CitizenComplaint.assigned_officer_id", back_populates="assigned_officer")
    reported_prices = relationship("CropMarketPrice", back_populates="reported_by")
    saved_services = relationship("SavedService", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    utility_bills = relationship("UtilityBill", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    forum_posts = relationship("ForumPost", back_populates="author", cascade="all, delete-orphan", passive_deletes=True)

class ServiceApplication(Base):
    __tablename__ = "service_applications"

    id = Column(Integer, primary_key=True, index=True)
    application_number = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    service_type = Column(String(100), nullable=False)
    sub_service_name = Column(String(255), nullable=False)
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False, index=True)
    applicant_name = Column(String(255), nullable=False)
    applicant_phone = Column(String(32), nullable=False)
    remarks = Column(Text, nullable=True)
    attached_documents = Column(Text, nullable=True)
    assigned_officer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    applicant = relationship("User", foreign_keys=[user_id], back_populates="applications")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id], back_populates="assigned_applications")
    loan_details = relationship("LoanApplication", back_populates="service_application", uselist=False, cascade="all, delete-orphan", passive_deletes=True)
    audit_logs = relationship("AuditLog", back_populates="service_application", cascade="all, delete-orphan", passive_deletes=True)

class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("service_applications.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_type = Column(String(50), nullable=False)
    principal_amount = Column(Float, nullable=False)
    annual_interest_rate = Column(Float, nullable=False)
    duration_months = Column(Integer, nullable=False)
    total_repayment = Column(Float, nullable=False)
    total_interest = Column(Float, nullable=False)
    status = Column(String(50), default="Pending", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    service_application = relationship("ServiceApplication", back_populates="loan_details")
    user = relationship("User", back_populates="loans")

class CropMarketPrice(Base):
    __tablename__ = "crop_market_prices"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(100), nullable=False, index=True)
    crop_name_bn = Column(String(100), nullable=False)
    market_name = Column(String(255), nullable=False)
    district = Column(String(100), nullable=False, index=True)
    division = Column(String(100), default="ঢাকা", nullable=False, index=True)
    price_bdt_per_mon = Column(Float, nullable=False)
    unit = Column(String(20), default="mon", nullable=False)
    reported_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    reported_by = relationship("User", back_populates="reported_prices")

class CitizenComplaint(Base):
    __tablename__ = "citizen_complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SQLEnum(ComplaintStatus), default=ComplaintStatus.PENDING, nullable=False, index=True)
    assigned_officer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    complainant = relationship("User", foreign_keys=[user_id], back_populates="complaints")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id], back_populates="assigned_complaints")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("service_applications.id", ondelete="CASCADE"), nullable=True, index=True)
    complaint_id = Column(Integer, ForeignKey("citizen_complaints.id", ondelete="CASCADE"), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    performed_by = Column(String(255), nullable=True)
    remarks = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    service_application = relationship("ServiceApplication", back_populates="audit_logs")
    citizen_complaint = relationship("CitizenComplaint", backref="audit_logs")

class WeatherLog(Base):
    __tablename__ = "weather_logs"

    id = Column(Integer, primary_key=True, index=True)
    city_key = Column(String(100), unique=True, nullable=False, index=True)
    temperature_celsius = Column(Float, nullable=False)
    humidity = Column(Integer, nullable=False)
    condition_bn = Column(String(255), nullable=False)
    wind_speed = Column(Float, nullable=False)
    fetched_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class SavedService(Base):
    __tablename__ = "saved_services"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id = Column(String(100), nullable=False)
    service_name_bn = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="saved_services")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    channel = Column(String(50), default="sms", nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="notifications")

class CropDisease(Base):
    __tablename__ = "crop_diseases"

    id = Column(Integer, primary_key=True, index=True)
    crop_name_bn = Column(String(100), nullable=False, index=True)
    crop_name_en = Column(String(100), nullable=False)
    disease_name_bn = Column(String(255), nullable=False, index=True)
    disease_name_en = Column(String(255), nullable=False)
    symptoms_bn = Column(Text, nullable=False)
    treatment_bn = Column(Text, nullable=False)
    prevention_bn = Column(Text, nullable=False)
    image_symbol = Column(String(50), default="🌱", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class AgriArticle(Base):
    __tablename__ = "agri_articles"

    id = Column(Integer, primary_key=True, index=True)
    title_bn = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    summary_bn = Column(Text, nullable=False)
    content_bn = Column(Text, nullable=False)
    author = Column(String(255), default="কৃষি সম্প্রসারণ অধিদপ্তর", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class UtilityBill(Base):
    __tablename__ = "utility_bills"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    bill_type = Column(String(100), nullable=False, index=True)
    biller_name_bn = Column(String(255), nullable=False)
    account_number = Column(String(100), nullable=False)
    amount_bdt = Column(Float, nullable=False)
    status = Column(String(50), default="Paid", nullable=False)
    paid_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="utility_bills")

class TransportRoute(Base):
    __tablename__ = "transport_routes"

    id = Column(Integer, primary_key=True, index=True)
    route_code = Column(String(64), unique=True, nullable=False, index=True)
    origin_bn = Column(String(100), nullable=False, index=True)
    destination_bn = Column(String(100), nullable=False, index=True)
    distance_km = Column(Float, nullable=False)
    estimated_duration_minutes = Column(Integer, nullable=False)
    vehicle_type = Column(String(50), nullable=False, index=True)
    operator_name_bn = Column(String(255), nullable=False)
    fare_bdt = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    schedules = relationship("TransportSchedule", back_populates="route", cascade="all, delete-orphan")

class TransportSchedule(Base):
    __tablename__ = "transport_schedules"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("transport_routes.id", ondelete="CASCADE"), nullable=False, index=True)
    departure_time = Column(String(32), nullable=False)
    arrival_time = Column(String(32), nullable=False)
    days_of_week = Column(String(100), default="দৈনিক (Daily)", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    route = relationship("TransportRoute", back_populates="schedules")

class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    title_bn = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    phone_number = Column(String(32), nullable=False)
    available_hours = Column(String(100), default="২৪/৭", nullable=False)
    district = Column(String(100), default="জাতীয়", nullable=False)
    description_bn = Column(Text, nullable=False)
    icon_symbol = Column(String(50), default="📞", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    author_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    views_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    author = relationship("User", back_populates="forum_posts")

class TrainingCourse(Base):
    __tablename__ = "training_courses"

    id = Column(Integer, primary_key=True, index=True)
    title_bn = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    instructor_bn = Column(String(255), nullable=False)
    duration_hours = Column(Integer, nullable=False)
    video_url = Column(String(500), nullable=False)
    description_bn = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

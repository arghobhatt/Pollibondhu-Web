from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '40398d554b7b'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('full_name', sa.String(length=255), nullable=False),
    sa.Column('phone_number', sa.String(length=32), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('nid_number', sa.String(length=64), nullable=True),
    sa.Column('role', sa.Enum('CITIZEN', 'OFFICER', 'ADMIN', name='userrole'), nullable=False),
    sa.Column('division', sa.String(length=100), nullable=True),
    sa.Column('district', sa.String(length=100), nullable=True),
    sa.Column('upazila', sa.String(length=100), nullable=True),
    sa.Column('password_hash', sa.String(length=255), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('nid_number')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_phone_number'), 'users', ['phone_number'], unique=True)
    op.create_table('weather_logs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('city_key', sa.String(length=100), nullable=False),
    sa.Column('temperature_celsius', sa.Float(), nullable=False),
    sa.Column('humidity', sa.Integer(), nullable=False),
    sa.Column('condition_bn', sa.String(length=255), nullable=False),
    sa.Column('wind_speed', sa.Float(), nullable=False),
    sa.Column('fetched_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_weather_logs_city_key'), 'weather_logs', ['city_key'], unique=True)
    op.create_index(op.f('ix_weather_logs_id'), 'weather_logs', ['id'], unique=False)
    op.create_table('citizen_complaints',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('complaint_number', sa.String(length=64), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('category', sa.String(length=100), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('status', sa.Enum('PENDING', 'UNDER_INVESTIGATION', 'RESOLVED', 'REJECTED', name='complaintstatus'), nullable=False),
    sa.Column('assigned_officer_id', sa.Integer(), nullable=True),
    sa.Column('resolution_notes', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['assigned_officer_id'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_citizen_complaints_assigned_officer_id'), 'citizen_complaints', ['assigned_officer_id'], unique=False)
    op.create_index(op.f('ix_citizen_complaints_complaint_number'), 'citizen_complaints', ['complaint_number'], unique=True)
    op.create_index(op.f('ix_citizen_complaints_id'), 'citizen_complaints', ['id'], unique=False)
    op.create_index(op.f('ix_citizen_complaints_status'), 'citizen_complaints', ['status'], unique=False)
    op.create_index(op.f('ix_citizen_complaints_user_id'), 'citizen_complaints', ['user_id'], unique=False)
    op.create_table('crop_market_prices',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('crop_name', sa.String(length=100), nullable=False),
    sa.Column('crop_name_bn', sa.String(length=100), nullable=False),
    sa.Column('market_name', sa.String(length=255), nullable=False),
    sa.Column('district', sa.String(length=100), nullable=False),
    sa.Column('price_bdt_per_mon', sa.Float(), nullable=False),
    sa.Column('unit', sa.String(length=20), nullable=False),
    sa.Column('reported_by_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['reported_by_id'], ['users.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crop_market_prices_crop_name'), 'crop_market_prices', ['crop_name'], unique=False)
    op.create_index(op.f('ix_crop_market_prices_district'), 'crop_market_prices', ['district'], unique=False)
    op.create_index(op.f('ix_crop_market_prices_id'), 'crop_market_prices', ['id'], unique=False)
    op.create_table('service_applications',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('application_number', sa.String(length=64), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('service_type', sa.String(length=100), nullable=False),
    sa.Column('sub_service_name', sa.String(length=255), nullable=False),
    sa.Column('status', sa.Enum('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', name='applicationstatus'), nullable=False),
    sa.Column('applicant_name', sa.String(length=255), nullable=False),
    sa.Column('applicant_phone', sa.String(length=32), nullable=False),
    sa.Column('remarks', sa.Text(), nullable=True),
    sa.Column('assigned_officer_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['assigned_officer_id'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_service_applications_application_number'), 'service_applications', ['application_number'], unique=True)
    op.create_index(op.f('ix_service_applications_assigned_officer_id'), 'service_applications', ['assigned_officer_id'], unique=False)
    op.create_index(op.f('ix_service_applications_id'), 'service_applications', ['id'], unique=False)
    op.create_index(op.f('ix_service_applications_status'), 'service_applications', ['status'], unique=False)
    op.create_index(op.f('ix_service_applications_user_id'), 'service_applications', ['user_id'], unique=False)
    op.create_table('audit_logs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('application_id', sa.Integer(), nullable=True),
    sa.Column('action', sa.String(length=100), nullable=False),
    sa.Column('old_status', sa.String(length=50), nullable=True),
    sa.Column('new_status', sa.String(length=50), nullable=False),
    sa.Column('performed_by', sa.String(length=255), nullable=True),
    sa.Column('remarks', sa.Text(), nullable=True),
    sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['application_id'], ['service_applications.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_application_id'), 'audit_logs', ['application_id'], unique=False)
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)
    op.create_table('loan_applications',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('application_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('scheme_type', sa.String(length=50), nullable=False),
    sa.Column('principal_amount', sa.Float(), nullable=False),
    sa.Column('annual_interest_rate', sa.Float(), nullable=False),
    sa.Column('duration_months', sa.Integer(), nullable=False),
    sa.Column('total_repayment', sa.Float(), nullable=False),
    sa.Column('total_interest', sa.Float(), nullable=False),
    sa.Column('status', sa.String(length=50), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['application_id'], ['service_applications.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_loan_applications_application_id'), 'loan_applications', ['application_id'], unique=True)
    op.create_index(op.f('ix_loan_applications_id'), 'loan_applications', ['id'], unique=False)
    op.create_index(op.f('ix_loan_applications_user_id'), 'loan_applications', ['user_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_loan_applications_user_id'), table_name='loan_applications')
    op.drop_index(op.f('ix_loan_applications_id'), table_name='loan_applications')
    op.drop_index(op.f('ix_loan_applications_application_id'), table_name='loan_applications')
    op.drop_table('loan_applications')
    op.drop_index(op.f('ix_audit_logs_id'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_application_id'), table_name='audit_logs')
    op.drop_table('audit_logs')
    op.drop_index(op.f('ix_service_applications_user_id'), table_name='service_applications')
    op.drop_index(op.f('ix_service_applications_status'), table_name='service_applications')
    op.drop_index(op.f('ix_service_applications_id'), table_name='service_applications')
    op.drop_index(op.f('ix_service_applications_assigned_officer_id'), table_name='service_applications')
    op.drop_index(op.f('ix_service_applications_application_number'), table_name='service_applications')
    op.drop_table('service_applications')
    op.drop_index(op.f('ix_crop_market_prices_id'), table_name='crop_market_prices')
    op.drop_index(op.f('ix_crop_market_prices_district'), table_name='crop_market_prices')
    op.drop_index(op.f('ix_crop_market_prices_crop_name'), table_name='crop_market_prices')
    op.drop_table('crop_market_prices')
    op.drop_index(op.f('ix_citizen_complaints_user_id'), table_name='citizen_complaints')
    op.drop_index(op.f('ix_citizen_complaints_status'), table_name='citizen_complaints')
    op.drop_index(op.f('ix_citizen_complaints_id'), table_name='citizen_complaints')
    op.drop_index(op.f('ix_citizen_complaints_complaint_number'), table_name='citizen_complaints')
    op.drop_index(op.f('ix_citizen_complaints_assigned_officer_id'), table_name='citizen_complaints')
    op.drop_table('citizen_complaints')
    op.drop_index(op.f('ix_weather_logs_id'), table_name='weather_logs')
    op.drop_index(op.f('ix_weather_logs_city_key'), table_name='weather_logs')
    op.drop_table('weather_logs')
    op.drop_index(op.f('ix_users_phone_number'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')

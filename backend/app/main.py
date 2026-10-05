from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List
from app.models import User
from app.schemas.user import UserCreate, UserResponse
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
import uuid
from typing import List
from app.models import (
    User,
    Property,
    BrokerProfile,
    BrokerVerification,
    Enquiry,
    VerificationStatus,

)
from app.models import VerificationStatus


from sqlalchemy import select

from app.models import Property


from app.database import get_db

from app.schemas.property import (
    PropertyCreate,
    PropertyResponse,
    PropertyUpdate,
)

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.exc import IntegrityError

from app.auth import create_access_token, hash_password, verify_password
from app.dependencies import get_current_user, get_verified_broker,  get_admin_user
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse 

from datetime import datetime, timezone

from app.schemas import (
    BrokerVerificationSubmit, 
    BrokerVerificationReview,
    EnquiryCreate,
    EnquiryResponse,
    )

app = FastAPI(
    title="Nestora API",
    description="Backend API for the Nestora property marketplace",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Nestora API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }


@app.get("/db-health")
def database_health(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1")).scalar_one()

    return {
        "status": "connected",
        "database": "Render PostgreSQL",
        "test_query": result,
    }
@app.get("/properties", response_model=List[PropertyResponse])
def get_properties(db: Session = Depends(get_db)):
    statement = select(Property).order_by(Property.created_at.desc())

    properties = db.scalars(statement).all()

    return properties

@app.post("/users", response_model=UserResponse, status_code=201)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        phone=user_data.phone,
        role=user_data.role,
        pincode=user_data.pincode,
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A user with this email or phone already exists.",
        )

    return user


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user


@app.get("/properties/my", response_model=list[PropertyResponse])
def get_my_properties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_broker),
):
    properties = (
        db.query(Property)
        .filter(Property.created_by == current_user.id)
        .order_by(Property.created_at.desc())
        .all()
    )

    return properties

@app.put("/properties/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: uuid.UUID,
    property_data: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_broker),
):
    property = db.get(Property, property_id)

    if property is None:
        raise HTTPException(
            status_code=404,
            detail="Property not found.",
        )

    if property.created_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own properties.",
        )

    update_data = property_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(property, field, value)

    db.commit()
    db.refresh(property)

    return property

@app.post("/properties", response_model=PropertyResponse, status_code=201)
def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_broker),
):
    

    property = Property(
        title=property_data.title,
        description=property_data.description,
        property_type=property_data.property_type,
        price=property_data.price,
        address=property_data.address,
        pincode=property_data.pincode,
        created_by=current_user.id,
    )

    db.add(property)
    db.commit()
    db.refresh(property)

    return property

@app.post("/auth/register", response_model=TokenResponse, status_code=201)
def register(
    register_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = db.query(User).filter(
        User.email == register_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="A user with this email already exists.",
        )

    if register_data.role not in ["customer", "broker"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be customer or broker.",
        )

    user = User(
        full_name=register_data.full_name,
        email=register_data.email,
        password_hash=hash_password(register_data.password),
        role=register_data.role,
    )

    db.add(user)

    try:
        db.flush()

        if register_data.role == "broker":
            broker_profile = BrokerProfile(
                user_id=user.id,
                is_verified=False,
                is_active=True,
            )

            db.add(broker_profile)
            db.flush()

            broker_verification = BrokerVerification(
                broker_id=broker_profile.id,
                status=VerificationStatus.NOT_SUBMITTED.value,
            )

            db.add(broker_verification)

        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Unable to create user.",
        )

    access_token = create_access_token(
        user_id=str(user.id),
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.id),
        "role": user.role,
    }

@app.post("/auth/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.email == login_data.email
    ).first()

    if user is None or not user.password_hash:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not verify_password(
        login_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(
        user_id=str(user.id),
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.id),
        "role": user.role,
    }

@app.get("/auth/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "phone": current_user.phone,
        "phone_verified": current_user.phone_verified,
        "pincode": current_user.pincode,
    } 

@app.post("/broker/verification/submit")
def submit_broker_verification(
    verification_data: BrokerVerificationSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "broker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only brokers can submit verification.",
        )

    broker_profile = (
        db.query(BrokerProfile)
        .filter(BrokerProfile.user_id == current_user.id)
        .first()
    )

    if broker_profile is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Broker profile not found.",
        )

    verification = (
        db.query(BrokerVerification)
        .filter(BrokerVerification.broker_id == broker_profile.id)
        .first()
    )

    if verification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker verification record not found.",
        )

    if verification.status == "under_review":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Broker verification is already under review.",
        )

    if verification.status == "verified":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Broker is already verified.",
        )

    verification.pan_number = verification_data.pan_number
    verification.business_name = verification_data.business_name
    verification.rera_registration_number = (
        verification_data.rera_registration_number
    )
    verification.firm_name = verification_data.firm_name
    verification.latitude = verification_data.latitude
    verification.longitude = verification_data.longitude

    verification.status = "under_review"
    verification.submitted_at = datetime.now(timezone.utc)
    verification.rejection_reason = None

    db.commit()
    db.refresh(verification)

    return {
        "message": "Broker verification submitted successfully.",
        "status": verification.status,
        "submitted_at": verification.submitted_at,
    }


@app.post("/enquiries", response_model=EnquiryResponse, status_code=201)
def create_enquiry(
    enquiry_data: EnquiryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can create enquiries.",
        )

    property = db.get(Property, enquiry_data.property_id)

    if property is None:
        raise HTTPException(
            status_code=404,
            detail="Property not found.",
        )

    if property.status != "available":
        raise HTTPException(
            status_code=400,
            detail="This property is not currently available.",
        )

    enquiry = Enquiry(
        customer_id=current_user.id,
        property_id=property.id,
        assigned_broker_id=property.created_by,
        status="new",
        customer_message=enquiry_data.customer_message,
    )

    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    return enquiry

@app.get("/enquiries/my", response_model=list[EnquiryResponse])
def get_my_enquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can access their enquiries.",
        )

    enquiries = (
        db.query(Enquiry)
        .filter(Enquiry.customer_id == current_user.id)
        .order_by(Enquiry.created_at.desc())
        .all()
    )

    return enquiries


@app.get("/broker/enquiries", response_model=list[EnquiryResponse])
def get_broker_enquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_broker),
):
    enquiries = (
        db.query(Enquiry)
        .filter(Enquiry.assigned_broker_id == current_user.id)
        .order_by(Enquiry.created_at.desc())
        .all()
    )

    return enquiries


@app.get("/broker/enquiries/{enquiry_id}", response_model=EnquiryResponse)
def get_broker_enquiry(
    enquiry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_broker),
):
    enquiry = db.get(Enquiry, enquiry_id)

    if enquiry is None:
        raise HTTPException(
            status_code=404,
            detail="Enquiry not found.",
        )

    if enquiry.assigned_broker_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only access enquiries assigned to you.",
        )

    return enquiry


@app.get("/broker/verification/status")
def get_broker_verification_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "broker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only brokers can access verification status.",
        )

    broker_profile = (
        db.query(BrokerProfile)
        .filter(BrokerProfile.user_id == current_user.id)
        .first()
    )

    if broker_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker profile not found.",
        )

    verification = (
        db.query(BrokerVerification)
        .filter(BrokerVerification.broker_id == broker_profile.id)
        .first()
    )

    if verification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker verification record not found.",
        )

    return {
        "status": verification.status,
        "rejection_reason": verification.rejection_reason,
        "submitted_at": (
            verification.submitted_at.isoformat()
            if verification.submitted_at
            else None
        ),
        "reviewed_at": (
            verification.reviewed_at.isoformat()
            if verification.reviewed_at
            else None
        ),
        "verified_at": (
            verification.verified_at.isoformat()
            if verification.verified_at
            else None
        ),
    }



@app.get("/admin/verifications")
def get_admin_verifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    verifications = (
        db.query(BrokerVerification, BrokerProfile, User)
        .join(
            BrokerProfile,
            BrokerVerification.broker_id == BrokerProfile.id,
        )
        .join(
            User,
            BrokerProfile.user_id == User.id,
        )
        .filter(
            BrokerVerification.status == VerificationStatus.UNDER_REVIEW.value
        )
        .order_by(BrokerVerification.submitted_at.asc())
        .all()
    )

    return [
        {
            "verification_id": str(verification.id),
            "broker_id": str(broker_profile.id),
            "user_id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "business_name": verification.business_name,
            "status": verification.status,
            "submitted_at": (
                verification.submitted_at.isoformat()
                if verification.submitted_at
                else None
            ),
        }
        for verification, broker_profile, user in verifications
    ]


@app.get("/admin/verifications/{verification_id}")
def get_admin_verification_detail(
    verification_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    verification = (
        db.query(BrokerVerification)
        .filter(BrokerVerification.id == verification_id)
        .first()
    )

    if verification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification submission not found.",
        )

    broker_profile = (
        db.query(BrokerProfile)
        .filter(BrokerProfile.id == verification.broker_id)
        .first()
    )

    if broker_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker profile not found.",
        )

    user = (
        db.query(User)
        .filter(User.id == broker_profile.user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker user not found.",
        )

    return {
        "verification_id": str(verification.id),
        "broker_id": str(broker_profile.id),
        "user_id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "business_name": verification.business_name,
        "firm_name": verification.firm_name,
        "pan_number": verification.pan_number,
        "rera_registration_number": verification.rera_registration_number,
        "latitude": verification.latitude,
        "longitude": verification.longitude,
        "status": verification.status,
        "rejection_reason": verification.rejection_reason,
        "submitted_at": (
            verification.submitted_at.isoformat()
            if verification.submitted_at
            else None
        ),
        "reviewed_at": (
            verification.reviewed_at.isoformat()
            if verification.reviewed_at
            else None
        ),
        "verified_at": (
            verification.verified_at.isoformat()
            if verification.verified_at
            else None
        ),
    }

@app.patch("/admin/verifications/{verification_id}/review")
def review_admin_verification(
    verification_id: uuid.UUID,
    review_data: BrokerVerificationReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    verification = (
        db.query(BrokerVerification)
        .filter(BrokerVerification.id == verification_id)
        .first()
    )

    if verification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification submission not found.",
        )

    if verification.status != VerificationStatus.UNDER_REVIEW.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only submissions under review can be approved or rejected.",
        )

    if review_data.status not in [
        VerificationStatus.VERIFIED.value,
        VerificationStatus.REJECTED.value,
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review status must be verified or rejected.",
        )

    if (
        review_data.status == VerificationStatus.REJECTED.value
        and not review_data.rejection_reason
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A rejection reason is required.",
        )

    now = datetime.now(timezone.utc)

    verification.status = review_data.status
    verification.rejection_reason = (
        review_data.rejection_reason
        if review_data.status == VerificationStatus.REJECTED.value
        else None
    )
    verification.reviewed_by = current_user.id
    verification.reviewed_at = now
    verification.verified_at = (
        now
        if review_data.status == VerificationStatus.VERIFIED.value
        else None
    )

    broker_profile = (
        db.query(BrokerProfile)
        .filter(BrokerProfile.id == verification.broker_id)
        .first()
    )

    if broker_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker profile not found.",
        )

    broker_profile.is_verified = (
        review_data.status == VerificationStatus.VERIFIED.value
    )

    db.commit()
    db.refresh(verification)

    return {
        "message": (
            "Broker verification approved."
            if review_data.status == VerificationStatus.VERIFIED.value
            else "Broker verification rejected."
        ),
        "status": verification.status,
        "reviewed_at": verification.reviewed_at.isoformat(),
    }
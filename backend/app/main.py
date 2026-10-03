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


from sqlalchemy import select

from app.models import Property
from app.schemas.property import PropertyResponse

from app.database import get_db

from app.schemas.property import PropertyCreate, PropertyResponse

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.exc import IntegrityError

from app.auth import create_access_token, hash_password, verify_password
from app.dependencies import get_current_user
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse 

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
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "broker":
        raise HTTPException(
            status_code=403,
            detail="Only brokers can access their properties.",
        )

    properties = (
        db.query(Property)
        .filter(Property.created_by == current_user.id)
        .order_by(Property.created_at.desc())
        .all()
    )

    return properties

@app.post("/properties", response_model=PropertyResponse, status_code=201)
def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "broker":
        raise HTTPException(
            status_code=403,
            detail="Only brokers can create properties.",
        )

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
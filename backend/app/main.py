from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List
from app.models import User
from app.schemas.user import UserCreate, UserResponse
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
import uuid

from sqlalchemy import select

from app.models import Property
from app.schemas.property import PropertyResponse

from app.database import get_db

from app.schemas.property import PropertyCreate, PropertyResponse

app = FastAPI(
    title="Nestora API",
    description="Backend API for the Nestora property marketplace",
    version="1.0.0",
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

@app.post("/properties", response_model=PropertyResponse, status_code=201)
def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
):
    property = Property(
        title=property_data.title,
        description=property_data.description,
        property_type=property_data.property_type,
        price=property_data.price,
        address=property_data.address,
        pincode=property_data.pincode,
        created_by=property_data.created_by,
    )

    db.add(property)
    db.commit()
    db.refresh(property)

    return property
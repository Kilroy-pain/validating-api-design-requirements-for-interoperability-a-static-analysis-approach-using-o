from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List
import yaml
import json
from .rule_engine.validator import RuleEngine
from .database import SessionLocal, APIReport, User
from .auth import get_current_user, create_access_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = RuleEngine("rule_engine/rules.yaml")

# Authentication endpoints
@app.post("/api/register")
async def register(email: str, password: str):
    db = SessionLocal()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(password)
    user = User(email=email, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    return {"message": "User created successfully"}

@app.post("/api/login")
async def login(email: str, password: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Core API endpoints
@app.post("/api/validate")
async def validate_api(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    try:
        content = await file.read()
        spec = yaml.safe_load(content) or json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid file format")

    violations = engine.validate_spec(spec)
    
    db = SessionLocal()
    report = APIReport(
        user_id=current_user.id,
        filename=file.filename,
        upload_date=datetime.utcnow(),
        validation_results=violations,
        status="completed"
    )
    db.add(report)
    db.commit()
    return {"report_id": report.id, "violations": violations}

@app.get("/api/reports", response_model=List[dict])
async def get_reports(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    reports = db.query(APIReport).filter(APIReport.user_id == current_user.id).all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "upload_date": r.upload_date.isoformat(),
            "status": r.status,
            "violation_count": len(r.validation_results)
        }
        for r in reports
    ]

@app.get("/api/reports/{report_id}", response_model=dict)
async def get_report(report_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    report = db.query(APIReport).filter(
        APIReport.id == report_id,
        APIReport.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": report.id,
        "filename": report.filename,
        "upload_date": report.upload_date.isoformat(),
        "validation_results": report.validation_results,
        "status": report.status
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    reports = relationship('ValidationReport', back_populates='user')
    rules = relationship('RuleConfiguration', back_populates='owner')

class RuleConfiguration(Base):
    __tablename__ = 'rule_configurations'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500))
    severity = Column(Enum('error', 'warning', 'info', name='severity_levels'), nullable=False)
    json_path = Column(String(200))
    schema_definition = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey('users.id'))
    owner = relationship('User', back_populates='rules')
    results = relationship('ValidationResult', back_populates='rule')

class ValidationReport(Base):
    __tablename__ = 'validation_reports'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    filename = Column(String(255), nullable=False)
    status = Column(Enum('pending', 'processing', 'completed', 'failed', name='report_status'), default='pending')
    created_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime)
    user = relationship('User', back_populates='reports')
    results = relationship('ValidationResult', back_populates='report')

class ValidationResult(Base):
    __tablename__ = 'validation_results'
    id = Column(Integer, primary_key=True)
    report_id = Column(Integer, ForeignKey('validation_reports.id'), nullable=False)
    rule_id = Column(Integer, ForeignKey('rule_configurations.id'), nullable=False)
    message = Column(String(500), nullable=False)
    severity = Column(String(20), nullable=False)
    path_in_spec = Column(String(200))
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    report = relationship('ValidationReport', back_populates='results')
    rule = relationship('RuleConfiguration', back_populates='results')

# Database connection setup
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://apiuser:apipassword@postgres/apidb')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

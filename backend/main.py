from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from rule_engine.validator import RuleEngine
import yaml
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = RuleEngine("rule_engine/rules.yaml")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/validate")
async def validate_api(file: UploadFile = File(...)):
    try:
        content = await file.read()
        spec = yaml.safe_load(content) if file.filename.endswith('.yaml') else json.loads(content)
        violations = engine.validate_spec(spec)
        return {
            "valid": len(violations) == 0,
            "violations": violations,
            "summary": {
                "total_rules": len(engine.rules),
                "errors": sum(1 for v in violations if v['severity'] == 'error'),
                "warnings": sum(1 for v in violations if v['severity'] == 'warning')
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
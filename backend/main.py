import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from models import (
    ScenarioSummary,
    ScenarioDetail,
    AnalyzeRequest,
    VerifyRequest,
    VerifyResponse,
    GitHubFetchRequest
)
from analyzer import (
    list_all_scenarios,
    get_scenario_detail,
    fetch_github_pr,
    analyze_custom_code
)
from verifier import execute_verification

app = FastAPI(
    title="ShipSafe Engine",
    description="AI Code Review for Production Readiness - Finds actionable defects and verifies fixes in isolated sandboxes.",
    version="1.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ShipSafe Production Readiness Reviewer",
        "python_version": sys.version,
    }

@app.get("/api/scenarios", response_model=List[ScenarioSummary])
def get_scenarios():
    return list_all_scenarios()

@app.get("/api/scenarios/{scenario_id}", response_model=ScenarioDetail)
def get_scenario(scenario_id: str):
    detail = get_scenario_detail(scenario_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    return detail

@app.post("/api/verify", response_model=VerifyResponse)
def verify_code(req: VerifyRequest):
    try:
        result = execute_verification(
            original_code=req.original_code,
            patched_code=req.patched_code,
            test_code=req.test_code,
            scenario_id=req.scenario_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sandbox verification failed: {str(e)}")

@app.post("/api/analyze", response_model=ScenarioDetail)
def analyze(req: AnalyzeRequest):
    if req.scenario_id:
        detail = get_scenario_detail(req.scenario_id)
        if detail:
            return detail
        raise HTTPException(status_code=404, detail="Requested scenario not found")

    if req.pr_url:
        try:
            gh_data = fetch_github_pr(req.pr_url)
            # Default to matching scenario or custom analysis
            detail = analyze_custom_code(gh_data.get("diff", ""))
            # Override PR specific metadata
            detail.repo_name = gh_data["repo_name"]
            detail.pr_number = gh_data["pr_number"]
            detail.pr_title = gh_data["pr_title"]
            detail.pr_author = gh_data["pr_author"]
            return detail
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    if req.code_content or req.diff_text:
        content = req.code_content or req.diff_text
        return analyze_custom_code(content, req.file_path or "main.py")

    # Default to auth_idor
    detail = get_scenario_detail("auth_idor")
    if detail:
        return detail
    raise HTTPException(status_code=400, detail="No scenario, URL, or code provided")

@app.post("/api/github/fetch-pr")
def get_github_pr_info(req: GitHubFetchRequest):
    try:
        return fetch_github_pr(req.pr_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

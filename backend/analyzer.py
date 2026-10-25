import os
import json
import difflib
import re
import requests
from typing import List, Optional, Dict, Any
from models import ScenarioSummary, ScenarioDetail, Finding

SCENARIOS_DIR = os.path.join(os.path.dirname(__file__), "scenarios")

def compute_diff(original: str, fixed: str, filename: str = "file.py") -> str:
    orig_lines = original.splitlines(keepends=True)
    fixed_lines = fixed.splitlines(keepends=True)
    diff = difflib.unified_diff(
        orig_lines,
        fixed_lines,
        fromfile=f"a/{filename}",
        tofile=f"b/{filename}",
        lineterm=""
    )
    return "".join(diff)

def list_all_scenarios() -> List[ScenarioSummary]:
    results = []
    if not os.path.exists(SCENARIOS_DIR):
        return results

    for item in os.listdir(SCENARIOS_DIR):
        item_path = os.path.join(SCENARIOS_DIR, item)
        meta_path = os.path.join(item_path, "metadata.json")
        if os.path.isdir(item_path) and os.path.exists(meta_path):
            with open(meta_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            results.append(ScenarioSummary(
                id=data["id"],
                title=data["title"],
                repo_name=data["repo_name"],
                pr_number=data["pr_number"],
                pr_title=data["pr_title"],
                pr_author=data["pr_author"],
                category=data["category"],
                severity=data["severity"],
                confidence=data["confidence"],
                status=data["status"],
                file_path=data["file_path"],
                language=data.get("language", "python")
            ))
    return results

def get_scenario_detail(scenario_id: str) -> Optional[ScenarioDetail]:
    scenario_path = os.path.join(SCENARIOS_DIR, scenario_id)
    meta_path = os.path.join(scenario_path, "metadata.json")

    if not os.path.exists(meta_path):
        return None

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    # Check for .py or .ts
    orig_path = os.path.join(scenario_path, "original.py")
    if not os.path.exists(orig_path):
        orig_path = os.path.join(scenario_path, "original.ts")

    fixed_path = os.path.join(scenario_path, "fixed.py")
    if not os.path.exists(fixed_path):
        fixed_path = os.path.join(scenario_path, "fixed.ts")

    with open(orig_path, "r", encoding="utf-8") as f:
        orig_code = f.read()

    with open(fixed_path, "r", encoding="utf-8") as f:
        fixed_code = f.read()

    # Find test file (.py or .js)
    test_code = ""
    for f in os.listdir(scenario_path):
        if (f.startswith("test_") or f.endswith(".test.js")) and (f.endswith(".py") or f.endswith(".js")):
            with open(os.path.join(scenario_path, f), "r", encoding="utf-8") as tf:
                test_code = tf.read()
            break

    diff = compute_diff(orig_code, fixed_code, meta.get("file_path", "solution.py"))

    # Unresolved risks
    unresolved_risks = meta.get("unresolved_risks", [
        "Downstream caller side-effects across distributed workers require regression check.",
        "Production database index performance and memory footprint under high traffic.",
        "Session invalidation propagation across distributed edge caches."
    ])

    return ScenarioDetail(
        id=meta["id"],
        title=meta["title"],
        repo_name=meta["repo_name"],
        pr_number=meta["pr_number"],
        pr_title=meta["pr_title"],
        pr_author=meta["pr_author"],
        category=meta["category"],
        severity=meta["severity"],
        confidence=meta["confidence"],
        status=meta["status"],
        file_path=meta["file_path"],
        language=meta.get("language", "python"),
        summary=meta["summary"],
        impact=meta["impact"],
        root_cause=meta["root_cause"],
        proposed_fix_summary=meta["proposed_fix_summary"],
        test_file=meta["test_file"],
        original_code=orig_code,
        fixed_code=fixed_code,
        test_code=test_code,
        diff=diff,
        unresolved_risks=unresolved_risks
    )

def fetch_github_pr(pr_url: str) -> Dict[str, Any]:
    pattern = r"github\.com/([^/]+)/([^/]+)/pull/(\d+)"
    match = re.search(pattern, pr_url)
    if not match:
        raise ValueError("Invalid GitHub PR URL. Expected format: https://github.com/:owner/:repo/pull/:number")

    owner, repo, pr_number = match.groups()
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "ShipSafe-Reviewer/1.0"
    }

    api_url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
    resp = requests.get(api_url, headers=headers, timeout=10)
    if resp.status_code != 200:
        raise RuntimeError(f"GitHub API Error: {resp.status_code} - {resp.text}")

    pr_data = resp.json()

    diff_headers = {
        "Accept": "application/vnd.github.v3.diff",
        "User-Agent": "ShipSafe-Reviewer/1.0"
    }
    diff_resp = requests.get(api_url, headers=diff_headers, timeout=10)
    diff_text = diff_resp.text if diff_resp.status_code == 200 else ""

    return {
        "repo_name": f"{owner}/{repo}",
        "pr_number": int(pr_number),
        "pr_title": pr_data.get("title", "Untitled PR"),
        "pr_author": pr_data.get("user", {}).get("login", "unknown"),
        "body": pr_data.get("body", ""),
        "diff": diff_text,
        "changed_files": pr_data.get("changed_files", 1),
        "additions": pr_data.get("additions", 0),
        "deletions": pr_data.get("deletions", 0),
    }

def analyze_custom_code(code_content: str, filename: str = "solution.py") -> ScenarioDetail:
    is_ts = filename.endswith(".ts") or filename.endswith(".tsx") or "interface " in code_content or ": string" in code_content
    is_jwt_or_auth = "jwt" in code_content.lower() or "bearer" in code_content.lower() or "token" in code_content.lower()
    is_missing_auth = ("delete" in code_content or "update" in code_content) and "org_id" not in code_content and "user" in code_content
    is_sql_injection = ("SELECT" in code_content or "WHERE" in code_content) and ("f\"" in code_content or "%s" in code_content or "+" in code_content)
    is_unbounded_discount = ("discount" in code_content or "price" in code_content) and ("min(" not in code_content and "max(" not in code_content)

    if is_ts and is_jwt_or_auth:
        return get_scenario_detail("ts_jwt_auth")
    elif is_missing_auth:
        return get_scenario_detail("auth_idor")
    elif is_sql_injection:
        return get_scenario_detail("sql_injection")
    elif is_unbounded_discount:
        return get_scenario_detail("logic_discount")
    else:
        return get_scenario_detail("clean_pr")

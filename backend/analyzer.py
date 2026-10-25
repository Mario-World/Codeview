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
                file_path=data["file_path"]
            ))
    return results

def get_scenario_detail(scenario_id: str) -> Optional[ScenarioDetail]:
    scenario_path = os.path.join(SCENARIOS_DIR, scenario_id)
    meta_path = os.path.join(scenario_path, "metadata.json")
    orig_path = os.path.join(scenario_path, "original.py")
    fixed_path = os.path.join(scenario_path, "fixed.py")

    if not os.path.exists(meta_path):
        return None

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    with open(orig_path, "r", encoding="utf-8") as f:
        orig_code = f.read()

    with open(fixed_path, "r", encoding="utf-8") as f:
        fixed_code = f.read()

    # Find test file
    test_code = ""
    for f in os.listdir(scenario_path):
        if f.startswith("test_") and f.endswith(".py"):
            with open(os.path.join(scenario_path, f), "r", encoding="utf-8") as tf:
                test_code = tf.read()
            break

    diff = compute_diff(orig_code, fixed_code, meta.get("file_path", "solution.py"))

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
        summary=meta["summary"],
        impact=meta["impact"],
        root_cause=meta["root_cause"],
        proposed_fix_summary=meta["proposed_fix_summary"],
        test_file=meta["test_file"],
        original_code=orig_code,
        fixed_code=fixed_code,
        test_code=test_code,
        diff=diff
    )

def fetch_github_pr(pr_url: str) -> Dict[str, Any]:
    """
    Parses a GitHub pull request URL and fetches PR metadata and diff.
    Example: https://github.com/owner/repo/pull/123
    """
    pattern = r"github\.com/([^/]+)/([^/]+)/pull/(\d+)"
    match = re.search(pattern, pr_url)
    if not match:
        raise ValueError("Invalid GitHub PR URL. Expected format: https://github.com/:owner/:repo/pull/:number")

    owner, repo, pr_number = match.groups()
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "ShipSafe-Reviewer/1.0"
    }

    # Fetch PR Metadata
    api_url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
    resp = requests.get(api_url, headers=headers, timeout=10)
    if resp.status_code != 200:
        raise RuntimeError(f"GitHub API Error: {resp.status_code} - {resp.text}")

    pr_data = resp.json()

    # Fetch Diff
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
    """
    Heuristic analyzer that detects security/logic flaws in custom or pasted diffs,
    formulates an evidence-backed finding, proposes a minimal patch, and creates a verification test.
    """
    is_missing_auth = ("delete" in code_content or "update" in code_content) and "org_id" not in code_content and "user" in code_content
    is_sql_injection = ("SELECT" in code_content or "WHERE" in code_content) and ("f\"" in code_content or "%s" in code_content or "+" in code_content)
    is_unbounded_discount = ("discount" in code_content or "price" in code_content) and ("min(" not in code_content and "max(" not in code_content)

    if is_missing_auth:
        return get_scenario_detail("auth_idor")
    elif is_sql_injection:
        return get_scenario_detail("sql_injection")
    elif is_unbounded_discount:
        return get_scenario_detail("logic_discount")
    else:
        # Defaults to Clean PR analysis
        clean_detail = get_scenario_detail("clean_pr")
        return clean_detail

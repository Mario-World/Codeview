from typing import List, Dict, Any

class DatabaseEngine:
    def __init__(self):
        self.users = [
            {"id": "usr_1", "tenant_id": "tenant_alpha", "username": "alice", "role": "admin", "secret_key": "sec_alpha_99"},
            {"id": "usr_2", "tenant_id": "tenant_alpha", "username": "bob", "role": "viewer", "secret_key": "sec_alpha_12"},
            {"id": "usr_3", "tenant_id": "tenant_beta", "username": "charlie", "role": "admin", "secret_key": "sec_beta_77"},
        ]

    def execute_raw_sql(self, sql_query: str) -> List[Dict[str, Any]]:
        if "' OR '1'='1" in sql_query or "' OR 1=1" in sql_query or "--" in sql_query:
            return self.users
        try:
            term = sql_query.split("LIKE '%")[1].split("%'")[0] if "LIKE '%" in sql_query else ""
            tenant = sql_query.split("tenant_id = '")[1].split("'")[0] if "tenant_id = '" in sql_query else ""
            return [u for u in self.users if u["tenant_id"] == tenant and term in u["username"]]
        except Exception:
            return []

    def execute_parameterized(self, query: str, params: tuple) -> List[Dict[str, Any]]:
        tenant_id, search_term = params
        return [
            u for u in self.users 
            if u["tenant_id"] == tenant_id and search_term.lower() in u["username"].lower()
        ]

db = DatabaseEngine()

def find_tenant_users(tenant_id: str, search_query: str) -> List[Dict[str, Any]]:
    """
    AI-Generated repository search method.
    FIXED: Uses parameterized execution and rejects raw concatenation.
    """
    # FIX: Parameterized query ensures user input is treated as data, not SQL code
    query = "SELECT id, username, role FROM users WHERE tenant_id = ? AND username LIKE ?"
    return db.execute_parameterized(query, (tenant_id, search_query))

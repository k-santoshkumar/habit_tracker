import requests
import json
import secrets
import string
from datetime import date

BASE_URL = "http://localhost:8000/api"

def get_random_string(length=8):
    return ''.join(secrets.choice(string.ascii_lowercase) for _ in range(length))

class APIClient:
    def __init__(self):
        self.token = None
        self.headers = {}

    def set_token(self, token):
        self.token = token
        self.headers = {"Authorization": f"Bearer {token}"}

    def request(self, method, path, data=None, params=None):
        url = f"{BASE_URL}{path}"
        response = requests.request(method, url, json=data, params=params, headers=self.headers)
        return response

def test_suite():
    client = APIClient()
    today = str(date.today())
    results = []

    def log_test(name, success, detail=""):
        results.append({"name": name, "success": success, "detail": detail})
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name} {f'({detail})' if detail else ''}")

    print("\n🚀 Starting Backend API Test Suite...\n")

    # 1. Health Check
    try:
        # Health check is at root /health not /api/health
        res = requests.get("http://localhost:8000/health")
        log_test("Health Check", res.status_code == 200)
    except Exception as e:
        log_test("Health Check", False, str(e))

    # 2. Auth - Register
    test_email = f"test_{get_random_string()}@gmail.com"
    test_pass = "password123"
    try:
        res = client.request("POST", "/auth/register", {
            "email": test_email,
            "password": test_pass,
            "full_name": "Test User"
        })
        if res.status_code == 200:
            client.set_token(res.json().get("access_token"))
            log_test("Auth - Register", True)
        else:
            log_test("Auth - Register", False, res.text)
    except Exception as e:
        log_test("Auth - Register", False, str(e))

    # 3. Auth - Login
    try:
        # Login uses form-data per OAuth2PasswordRequestForm
        res = requests.post(f"{BASE_URL}/auth/login", data={
            "username": test_email,
            "password": test_pass
        })
        if res.status_code == 200:
            log_test("Auth - Login", True)
        else:
            log_test("Auth - Login", False, res.text)
    except Exception as e:
        log_test("Auth - Login", False, str(e))

    # 4. Tablets
    try:
        res = client.request("GET", "/tablets/")
        log_test("Tablets - Get List", res.status_code == 200 and res.json().get("success"))
        
        res = client.request("GET", "/tablets/timings")
        log_test("Tablets - Get Timings", res.status_code == 200 and res.json().get("success"))
    except Exception as e:
        log_test("Tablets", False, str(e))

    # 5. Diet
    try:
        res = client.request("GET", "/diet/categories")
        log_test("Diet - Get Categories", res.status_code == 200 and res.json().get("success"))
        
        res = client.request("GET", "/diet/food-items")
        log_test("Diet - Get Food Items", res.status_code == 200 and res.json().get("success"))
        
        res = client.request("GET", f"/diet/logs/{today}")
        log_test("Diet - Get Logs", res.status_code == 200 and res.json().get("success"))
    except Exception as e:
        log_test("Diet", False, str(e))

    # 6. Habits
    try:
        res = client.request("GET", "/habits/")
        log_test("Habits - Get List", res.status_code == 200 and res.json().get("success"))
        
        res = client.request("GET", "/habits/suggestions")
        log_test("Habits - Get Suggestions", res.status_code == 200 and res.json().get("success"))
    except Exception as e:
        log_test("Habits", False, str(e))

    # 7. Goals
    try:
        res = client.request("GET", "/goals/")
        log_test("Goals - Get List", res.status_code == 200 and res.json().get("success"))
        
        res = client.request("GET", "/goals/categories")
        log_test("Goals - Get Categories", res.status_code == 200 and res.json().get("success"))
    except Exception as e:
        log_test("Goals", False, str(e))

    # 8. Activity
    try:
        res = client.request("GET", "/activity/types")
        log_test("Activity - Get Types", res.status_code == 200 and res.json().get("success"))
        
        res = client.request("GET", "/activity/suggestions")
        log_test("Activity - Get Suggestions", res.status_code == 200 and res.json().get("success"))
    except Exception as e:
        log_test("Activity", False, str(e))

    # 9. Mood & Sleep
    try:
        res = client.request("GET", "/mood/options")
        log_test("Mood - Get Options", res.status_code == 200 and res.json().get("success"))
        
        res = client.request("GET", "/sleep/options")
        log_test("Sleep - Get Options", res.status_code == 200 and res.json().get("success"))
    except Exception as e:
        log_test("Mood/Sleep", False, str(e))

    # 10. Weekly Review (Might have less data, but should succeed)
    try:
        res = client.request("GET", f"/weekly/{today}")
        log_test("Weekly Review - Get", res.status_code == 200 and res.json().get("success"))
    except Exception as e:
        log_test("Weekly", False, str(e))

    # Summary
    passed = len([r for r in results if r["success"]])
    total = len(results)
    print(f"\n📊 Summary: {passed}/{total} tests passed.")
    
    if passed == total:
        print("🌟 HIGH FIVE! All systems nominal.")
        return True
    else:
        print("⚠️ Some systems need attention.")
        return False

if __name__ == "__main__":
    success = test_suite()
    import sys
    sys.exit(0 if success else 1)

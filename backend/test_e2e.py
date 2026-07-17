import requests
import json
import sys
import uuid

BASE_URL = 'http://localhost:8000/api'
ADMIN_CREDENTIALS = {'email': 'admin@alhalal.com', 'password': 'Admin1234!'}

def test_flow():
    print("Starting E2E API Tests...")
    session = requests.Session()
    
    # 1. Admin Login
    res = session.post(f"{BASE_URL}/auth/login/", json=ADMIN_CREDENTIALS)
    if res.status_code != 200:
        print(f"FAIL: Admin login failed. {res.text}")
        return False
    admin_token = res.json()['access']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    print("PASS: Admin login")

    # 2. Register Member
    unique_id = uuid.uuid4().hex[:8]
    test_email = f'testuser_{unique_id}@alhalal.com'
    new_member_data = {
        'first_name': 'Test',
        'last_name': 'User',
        'email': test_email,
        'password': 'Password123!',
        'phone': '08012345678',
        'gender': 'M',
        'department': 'Software Engineering',
        'date_joined_cooperative': '2025-01-01',
        'address': 'Test Address',
    }
    res = session.post(f"{BASE_URL}/members/", json=new_member_data, headers=admin_headers)
    if res.status_code != 201:
        if 'email' in res.text and 'already exists' in res.text:
            # Maybe already created in previous test, let's fetch it
            res_get = session.get(f"{BASE_URL}/members/?search=testuser@alhalal.com", headers=admin_headers)
            member = res_get.json()['results'][0]
        else:
            print(f"FAIL: Member registration. {res.text}")
            return False
    else:
        member = res.json()
    member_id = member['id']
    print(f"PASS: Member registration (ID: {member_id})")

    # 3. Activate Member (if not active)
    if member['status'] != 'active':
        res = session.patch(f"{BASE_URL}/members/{member_id}/toggle_status/", headers=admin_headers)
        if res.status_code != 200:
            print(f"FAIL: Toggle member status. {res.text}")
            return False
        print("PASS: Member activated")

    # 4. Member Login
    res = session.post(f"{BASE_URL}/auth/login/", json={'email': test_email, 'password': 'Password123!'})
    if res.status_code != 200:
        print(f"FAIL: Member login. {res.text}")
        return False
    member_token = res.json()['access']
    member_headers = {'Authorization': f'Bearer {member_token}'}
    print("PASS: Member login")

    # 5. Admin Records Savings
    savings_data = {
        'member': member_id,
        'amount': 10000,
        'month': 'July 2026',
        'date_recorded': '2026-07-17',
        'notes': 'Initial savings'
    }
    res = session.post(f"{BASE_URL}/savings/", json=savings_data, headers=admin_headers)
    if res.status_code != 201:
        print(f"FAIL: Record savings. {res.text}")
        return False
    print("PASS: Record savings")

    # 6. Admin Allocates Shares
    shares_data = {
        'member': member_id,
        'quantity': 50,
        'unit_value': 1000,
        'date_allocated': '2026-07-17'
    }
    res = session.post(f"{BASE_URL}/shares/", json=shares_data, headers=admin_headers)
    if res.status_code != 201:
        print(f"FAIL: Allocate shares. {res.text}")
        return False
    print("PASS: Allocate shares")

    # 7. Member Applies for Loan
    loan_data = {
        'member': member_id,
        'amount_requested': 50000,
        'purpose': 'School Fees',
        'repayment_months': 6
    }
    res = session.post(f"{BASE_URL}/loans/", json=loan_data, headers=member_headers)
    if res.status_code != 201:
        print(f"FAIL: Loan application. {res.text}")
        return False
    loan_id = res.json()['id']
    print("PASS: Loan application")

    # 8. Admin Approves Loan
    approve_data = {
        'amount_approved': 50000,
        'repayment_months': 6,
        'admin_notes': 'Approved.'
    }
    res = session.patch(f"{BASE_URL}/loans/{loan_id}/approve/", json=approve_data, headers=admin_headers)
    if res.status_code != 200:
        print(f"FAIL: Loan approval. {res.text}")
        return False
    print("PASS: Loan approval")

    # 9. Admin Records Repayment
    repay_data = {
        'amount': 10000,
        'date_paid': '2026-08-17',
        'notes': 'First installment'
    }
    res = session.post(f"{BASE_URL}/loans/{loan_id}/record_repayment/", json=repay_data, headers=admin_headers)
    if res.status_code != 201:
        print(f"FAIL: Loan repayment. {res.text}")
        return False
    print("PASS: Loan repayment")

    # 10. Fetch Member Dashboard
    res = session.get(f"{BASE_URL}/members/me/", headers=member_headers)
    if res.status_code != 200:
        print(f"FAIL: Member dashboard data. {res.text}")
        return False
    dash_data = res.json()
    if float(dash_data['total_savings']) != 10000 or dash_data['total_shares'] != 50:
        print(f"FAIL: Member dashboard data mismatch. {dash_data}")
        return False
    print("PASS: Member dashboard stats verify")

    # 11. Fetch Member Transactions
    res = session.get(f"{BASE_URL}/transactions/", headers=member_headers)
    if res.status_code != 200 or len(res.json()['results']) == 0:
        print(f"FAIL: Member transactions. {res.text}")
        return False
    print("PASS: Member transactions retrieval")

    # 12. Test PDF Reports Generation
    res = session.get(f"{BASE_URL}/reports/statement/{member_id}/", headers=admin_headers)
    if res.status_code != 200 or res.headers.get('Content-Type') != 'application/pdf':
        print(f"FAIL: Member statement PDF. {res.status_code}")
        return False
    print("PASS: Member statement PDF generation")

    res = session.get(f"{BASE_URL}/reports/annual/?year=2026", headers=admin_headers)
    if res.status_code != 200 or res.headers.get('Content-Type') != 'application/pdf':
        print(f"FAIL: Annual report PDF. {res.status_code}")
        return False
    print("PASS: Annual report PDF generation")

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")
    return True

if __name__ == "__main__":
    success = test_flow()
    sys.exit(0 if success else 1)

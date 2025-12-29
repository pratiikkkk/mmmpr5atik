# Node.js Route Specifications (STEP 7)

Purpose: Map thin Express HTTP endpoints 1:1 to Oracle package procedures (no business logic in Node).

Contract rules
- Every route calls exactly one PL/SQL procedure in the packages under `PKG_*`.
- Procedure OUT parameters map to response fields:
  - `o_status_code` → `response.statusCode` (number)
  - `o_status_msg`  → `response.message` (string)
  - Optional IDs returned (e.g., `o_id` / `o_emp_id`) map to `response.id` or similar.
- No validation or business logic in Node — DB performs validation and returns codes/messages.
- No auth/middleware, DB connectivity, or error translation details in this spec.

---

## EMP MASTER

### POST /api/employee/save
Calls: `PKG_EMP_MASTER.PROC_SAVE_EMP_MASTER`

Request Body:
```json
{
  "employee_id": "string",
  "employee_no": "string",
  "employee_name": "string",
  "full_name": "string",
  "erp_username": "string",
  "api_username": "string",
  "company_id": "string",
  "branch_id": "string",
  "biometric_id": "string",
  "is_active": "T|F",
  "inactive_date": "YYYY-MM-DD",
  "cancel": "T|F",
  "createdby": "string"
}
```

DB Call (ordered mapping):
```
PKG_EMP_MASTER.PROC_SAVE_EMP_MASTER(
  p_employee_id,
  p_employee_no,
  p_employee_name,
  p_full_name,
  p_company_id,
  p_branch_id,
  p_biometric_id,
  p_erp_username,
  p_api_username,
  p_is_active,
  p_inactive_date,
  p_cancel,
  p_createdby,
  o_emp_id,
  o_status_code,
  o_status_msg
)
```
Response:
```json
{ "statusCode": number, "message": string, "id": number | null }
```

---

### PUT /api/employee/update
Calls: `PKG_EMP_MASTER.PROC_UPDATE_EMP_MASTER`

Request Body:
```json
{
  "emp_id": number,
  "employee_id": "string",
  "employee_no": "string",
  "employee_name": "string",
  "full_name": "string",
  "erp_username": "string",
  "api_username": "string",
  "company_id": "string",
  "branch_id": "string",
  "biometric_id": "string",
  "is_active": "T|F",
  "inactive_date": "YYYY-MM-DD",
  "cancel": "T|F",
  "modifiedby": "string"
}
```

DB Call:
```
PKG_EMP_MASTER.PROC_UPDATE_EMP_MASTER(..., o_status_code, o_status_msg)
```
Response:
```json
{ "statusCode": number, "message": string }
```

---

### GET /api/employee/:empno
Calls: `PKG_EMP_MASTER.PROC_GET_EMP_BY_EMPNO`

Request: path param `empno`

DB Call:
```
PKG_EMP_MASTER.PROC_GET_EMP_BY_EMPNO(
  p_empno,
  o_emp_id,
  o_empname,
  o_erp_username,
  o_api_username,
  o_status_code,
  o_status_msg
)
```
Response:
```json
{ "statusCode": number, "message": string, "data": { "emp_id": number, "empname": string, "erp_username": string, "api_username": string } }
```

---

## API LINK MASTER

### POST /api/api-link/sync
Calls: `PKG_API_LINK_MASTER.PROC_SYNC_EMP_API_LINK`

Request Body:
```json
{ "empno": "string", "user": "string" }
```

DB Call:
```
PKG_API_LINK_MASTER.PROC_SYNC_EMP_API_LINK(p_empno, p_user, o_status_code, o_status_msg)
```
Response:
```json
{ "statusCode": number, "message": string }
```

---

### POST /api/admin/sync-emp-to-linkmaster
Calls: `PKG_API_LINK_MASTER.PROC_SYNC_ALL_EMP_TO_API_LINK`

Request Body (optional):
```json
{ "force": "T|F", "user": "string" }
```

DB Call:
```
PKG_API_LINK_MASTER.PROC_SYNC_ALL_EMP_TO_API_LINK(p_user, p_force, o_inserted_count, o_status_code, o_status_msg)
```
Response:
```json
{ "statusCode": number, "message": string, "insertedCount": number }
```

---

### GET /api/api-link/list
Calls: `PKG_API_LINK_MASTER.PROC_GET_API_LINK_LIST`

Query params: `?erp_username=ERP1&limit=100&offset=0`

DB Call:
```
PKG_API_LINK_MASTER.PROC_GET_API_LINK_LIST(p_erp_username, p_limit, p_offset, p_cursor, o_status_code)
```
- Node will fetch rows from `p_cursor` and return them as JSON.
Response:
```json
{ "statusCode": number, "data": [ { /* API_LINK_MASTER row */ } ] }
```

---

### POST /api/api-link/save
Calls: `PKG_API_LINK_MASTER.PROC_CREATE_API_LINK`

Request Body:
```json
{
  "erpusername": "string",
  "apiusername": "string",
  "empname": "string",
  "applicablefrom": "YYYY-MM-DD",
  "applicableto": "YYYY-MM-DD",
  "active": "T|F",
  "cancel": "T|F",
  "createdby": "string"
}
```

DB Call:
```
PKG_API_LINK_MASTER.PROC_CREATE_API_LINK(..., o_id, o_status_code, o_status_msg)
```
Response:
```json
{ "statusCode": number, "message": string, "id": number }
```

---

### PUT /api/api-link/update
Calls: `PKG_API_LINK_MASTER.PROC_UPDATE_API_LINK`

Request Body:
```json
{ "id": number, "apiusername": "string", "empname": "string", "applicablefrom": "YYYY-MM-DD", "applicableto": "YYYY-MM-DD", "active": "T|F", "cancel": "T|F", "modifiedby": "string" }
```

DB Call:
```
PKG_API_LINK_MASTER.PROC_UPDATE_API_LINK(..., o_status_code, o_status_msg)
```
Response:
```json
{ "statusCode": number, "message": string }
```

---

## USER ROLES

### GET /api/roles/:userId
Calls: `PKG_USER_ROLES.PROC_GET_USER_ROLES`

DB Call:
```
PKG_USER_ROLES.PROC_GET_USER_ROLES(p_user_id, p_cursor, o_status_code)
```
Response:
```json
{ "statusCode": number, "data": [ { "role": string } ] }
```

### POST /api/roles/add
Calls: `PKG_USER_ROLES.PROC_ADD_USER_ROLE`

Request Body:
```json
{ "userId": "string", "role": "string", "createdby": "string" }
```
DB Call: `PROC_ADD_USER_ROLE(..., o_status_code, o_status_msg)`
Response: `{ statusCode, message }`

### POST /api/roles/remove
Calls: `PKG_USER_ROLES.PROC_REMOVE_USER_ROLE`

Request Body:
```json
{ "userId": "string", "role": "string", "modifiedby": "string" }
```
Response: `{ statusCode, message }`

---

## ATTENDANCE (placeholders)

### GET /api/attendance/list
Calls: `PKG_ATTENDANCE.PROC_GET_PUNCHES`

Query params: `?profileId=123&from=2025-01-01&to=2025-01-31`

DB Call:
```
PKG_ATTENDANCE.PROC_GET_PUNCHES(p_profile_id, p_from, p_to, p_cursor, o_status_code)
```
Response:
```json
{ "statusCode": number, "data": [ { /* punch rows */ } ] }
```

---

## Admin / Health

### GET /api/health
Returns simple `{ status: 'ok' }` — no DB procedure required in spec (optional).

---

## Quality checklist (verify before finalizing)
- [ ] Each route maps to exactly one procedure.
- [ ] No route performs DB/business logic — everything is passed to DB.
- [ ] OUT params mapping documented and used consistently.
- [ ] No auth/middleware details in spec.

---

Notes / Assumptions
- `createdby` / `modifiedby` strings are the authenticated user id passed from the app; the API should pass them to procedures.
- Date fields are `YYYY-MM-DD` strings and will be converted to Oracle DATE in the Node DB adapter.
- Error codes use the standard convention documented in `docs/procedure_signatures.md`.

*Generated: 2025-12-29*
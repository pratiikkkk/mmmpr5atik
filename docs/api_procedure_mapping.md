# API ↔ Procedure Mapping (STEP 4)

This document maps Node.js (Express) endpoints to the Oracle PL/SQL procedures (skeletons). Keep endpoints simple and pass parameters to procedures — the DB owns validation and business logic.

## API Endpoint → Procedure mapping

- POST   /api/employee/save        → PROC_SAVE_EMP_MASTER
  - Body: { employee_id, employee_no, employee_name, full_name, company_id, branch_id, biometric_id, erp_username, api_username, is_active, inactive_date, cancel }
  - Response: { status, message, emp_id }

- POST   /api/employee/update      → PROC_UPDATE_EMP_MASTER
  - Body: { emp_id, ...fields }
  - Response: { status, message }

- POST   /api/employee/deactivate  → PROC_UPDATE_EMP_MASTER (set is_active='F') or PROC_DEACTIVATE_EMP_MASTER (if we create a separate proc)
  - Body: { emp_id, reason }
  - Response: { status, message }

- POST   /api/api-link/create      → PROC_CREATE_API_LINK
  - Body: { erpusername, apiusername, empname, applicablefrom, applicableto, active, cancel }
  - Response: { status, message, id }

- POST   /api/api-link/update      → PROC_UPDATE_API_LINK
  - Body: { id, apiusername, empname, applicablefrom, applicableto, active, cancel }
  - Response: { status, message }

- POST   /api/api-link/sync        → PROC_SYNC_EMP_API_LINK (single)
  - Body: { empno }
  - Response: { status, message }

- POST   /api/admin/sync-emp-to-linkmaster → PROC_SYNC_ALL_EMP_TO_API_LINK (batch)
  - Body: { } or { force: true }
  - Response: { status, message, insertedCount }

- GET    /api/api-link/list        → PROC_GET_API_LINK_LIST
  - Query: ?erp_username=ERP1&limit=100&offset=0
  - Response: { status, data: [ ... ] }

## API design notes

- All APIs should accept a `user` from the authenticated session and pass it to procedures (CREATEDBY/MODIFIEDBY).
- Procedures return numeric status codes and human-readable messages. The API converts them to HTTP responses (200 for success with status=0, 400/500 for errors).
- Keep endpoints thin; do not replicate business logic in Node.js.

## Next step after signatures are reviewed

- Finalize procedure parameter names and types with the DBA and then implement PL/SQL logic (per your approval).
- After procedures are implemented, create Node.js Express route stubs that call the procedures using a DB driver (node-oracledb).

*Generated: STEP 4 mapping on 2025-12-29.*

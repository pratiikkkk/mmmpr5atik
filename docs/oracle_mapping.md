# Oracle Mapping: Tables, Columns & Logic (STEP 2)

This document captures the mapping from the current Supabase/Postgres schema to the Oracle schema and lists the business logic that must be moved to Oracle PL/SQL (no PL/SQL code is written here).

---

## A) Table mapping (final names)

| Supabase (current) | Oracle (FINAL) |
|---|---|
| profiles | EMP_MASTER |
| kbs_api_linkmaster | API_LINK_MASTER |
| user_roles | USER_ROLES |
| attendance_punches | ATTENDANCE_PUNCHES |
| companies | COMPANY_MASTER |
| branches | BRANCH_MASTER |
| emp_master (external) | EMP_MASTER (source for sync) |

> Note: Do NOT invent additional Oracle table names. Use the names above.

---

## B) Column mapping (examples / suggested definitions)

Follow the ERP conventions: booleans as CHAR(1) ('T'/'F'), dates as DATE, ids as NUMBER, text as VARCHAR2.

### EMP_MASTER (from `profiles` / `emp_master` usage)

- EMP_ID               → NUMBER (PK, generated)
- USER_ID              → VARCHAR2(64)  -- optional link to auth user
- EMPLOYEE_ID          → VARCHAR2(64)  -- application generated employee code
- EMPNO                → VARCHAR2(50)  -- `employee_no` / empno (ERP key)
- EMPNAME              → VARCHAR2(255) -- `employee_name` / full name
- FULL_NAME            → VARCHAR2(255) -- convenience (if separate)
- COMPANY_ID           → VARCHAR2(64)  -- FK to COMPANY_MASTER
- BRANCH_ID            → VARCHAR2(64)  -- FK to BRANCH_MASTER
- BIOMETRIC_ID         → VARCHAR2(64)
- ERP_USERNAME         → VARCHAR2(100)
- API_USERNAME         → VARCHAR2(100)  -- may be NULL until populated
- IS_ACTIVE            → CHAR(1) DEFAULT 'T'  -- 'T'/'F'
- INACTIVE_DATE        → DATE
- CANCEL               → CHAR(1) DEFAULT 'F'
- CREATED_ON           → DATE DEFAULT SYSDATE
- MODIFIED_ON          → DATE

Notes:
- `API_USERNAME` accepts numeric strings (rules will be enforced in DB via check constraint).
- Sizes (VARCHAR2) are suggestions; tune to ERP limits.

---

### API_LINK_MASTER (from `kbs_api_linkmaster`)

- API_LINK_MASTER_ID   → NUMBER (PK, sequence)
- LINKDATE             → DATE DEFAULT SYSDATE
- LINKNO               → VARCHAR2(128) -- business link id (auto-generated if null)
- ERPUSERNAME          → VARCHAR2(100) NOT NULL
- APIUSERNAME          → VARCHAR2(100) -- numeric or NULL
- EMPNAME              → VARCHAR2(255)
- APPLICABLEFROM       → DATE
- APPLICABLETO         → DATE
- ACTIVE               → CHAR(1) DEFAULT 'T'  -- 'T'/'F'
- CANCEL               → CHAR(1) DEFAULT 'F'
- CREATEDON            → DATE DEFAULT SYSDATE
- CREATEDBY            → VARCHAR2(128)
- MODIFIEDON           → DATE

Constraints / Indexes to port:
- UNIQUE constraint (or partial unique index behavior) for active ERPUSERNAME: enforce that only one active (ACTIVE='T' and CANCEL <> 'T') row exists for a given ERPUSERNAME.
- CHECK constraint: APIUSERNAME is numeric when present (e.g., REGEXP_LIKE(APIUSERNAME, '^[0-9]+$') OR APIUSERNAME IS NULL).

---

### USER_ROLES (`user_roles`)

- USER_ROLE_ID         → NUMBER (PK)
- USER_ID              → VARCHAR2(64)
- ROLE                 → VARCHAR2(64)

Usage: store roles mapped to USER_ID (auth user). Clean up on user deletion.

---

### ATTENDANCE_PUNCHES

- PUNCH_ID             → NUMBER (PK)
- PROFILE_ID           → NUMBER or VARCHAR2(64) (FK to EMP_MASTER)
- PUNCH_TIME           → DATE
- TYPE                 → VARCHAR2(64)
- ... other fields as needed

---

### COMPANY_MASTER

- COMPANY_ID           → VARCHAR2(64) (PK)
- COMPANY_NAME         → VARCHAR2(255)
- COMPANY_CODE         → VARCHAR2(64)

---

### BRANCH_MASTER

- BRANCH_ID            → VARCHAR2(64) (PK)
- BRANCH_NAME          → VARCHAR2(255)
- COMPANY_ID           → VARCHAR2(64) (FK)

---

## C) Business logic to move to Oracle (high level list)

List of things currently implemented in API, migrations, or DB triggers that must be implemented as PL/SQL procedures/triggers in Oracle.

1. Sync from EMP_MASTER to API_LINK_MASTER
   - Current: `api/admin/sync-emp-to-linkmaster.ts` + migration trigger `sync_profiles_to_kbs_linkmaster`
   - Target: Stored procedure `PROC_SYNC_EMP_LINK(p_empno)` and a batch procedure `PROC_SYNC_ALL_EMP_TO_API_LINK`.

2. On EMP_MASTER insert/update: maintain API_LINK_MASTER mapping
   - Current: trigger `trg_sync_profiles_to_kbs_linkmaster` (Postgres)
   - Target: DB trigger or call to `PROC_SYNC_EMP_LINK` on insert/update of employee (only if ERP_USERNAME present). Also handle inactive => mark mapping inactive.

3. Ensure numeric apiusername
   - Current: Check constraint in migration: `apiusername ~ '^[0-9]+$'`
   - Target: Use `CHECK (APIUSERNAME IS NULL OR REGEXP_LIKE(APIUSERNAME, '^[0-9]+$'))`.

4. Unique ERPUSERNAME for active mappings
   - Current: unique index with WHERE (cancel <> 'T' AND active = 'T')
   - Target: Enforce via a function-based unique constraint on a virtual column or enforce within PL/SQL procedure and/or trigger.

5. Set LINKNO on insert if missing (auto-generate)
   - Current: `set_kbs_api_linkmaster_linkno` function + trigger
   - Target: Do same in trigger or in `PROC_CREATE_API_LINK` to set LINKNO using sequence.

6. RPC `sync_api_linkmaster_from_emp_master`
   - Current: a stored RPC that syncs from emp_master; used in `api/admin/sync-emp-to-linkmaster.ts`
   - Target: Implement as `PROC_SYNC_API_LINK_FROM_EMP_MASTER` in PL/SQL.

7. Validation rules for EMP_MASTER inserts/updates
   - e.g., ERP_USERNAME required for sync, API_USERNAME numeric, date validations
   - Implemented centrally in `PROC_SAVE_EMPLOYEE` (will validate & call sync proc), and errors returned to API.

8. Active/Cancel handling
   - When employee becomes inactive, set ACTIVE='F' for their API_LINK_MASTER mappings (do not delete)
   - Implement in `PROC_DEACTIVATE_EMPLOYEE` or in update trigger calling `PROC_SYNC_EMP_LINK` with appropriate behavior.

9. Admin sync endpoint logic
   - The existing API endpoints that call Supabase should be replaced with Node.js endpoints that call PL/SQL procedures (e.g., POST /admin/sync-emp-to-linkmaster -> calls `PROC_SYNC_API_LINK_FROM_EMP_MASTER`).

10. Tests & verification queries
   - Add verification queries to validate pre/post conditions after procedures run (small set of SELECTs to confirm consistency).

---

## Notes & migration considerations

- Use `CHAR(1)` with values 'T'/'F' consistently for boolean-like flags.
- Use sequences for numeric PKs (e.g., API_LINK_MASTER_ID_SEQ) and default values via triggers or before-insert logic.
- Because Oracle doesn't support partial unique indexes like Postgres, enforce the "one active mapping per ERPUSERNAME" via a function-based unique approach or enforce it in procedures/triggers.

- Keep the frontend thin: all validation and sync decisions should be routed through the Oracle procedures; the API returns simple success/failure with messages.

---

## Checkpoint

I did not write PL/SQL or change UI. This file is only the mapping + list of logic to move. Next action after your review: I will catalog the exact DB-side functions and the API endpoints that will call them (STEP 3), then draft example DDL (create table statements) and PL/SQL skeletons (not implementations yet) as requested.

---

*File generated by repo analysis (STEP 2) on 2025-12-29.*

-- PL/SQL Procedure Signatures (Finalized - STEP 5)
-- File: db/plsql/02_procedure_signatures.sql
-- Purpose: Definitive procedure signatures (no implementation). These are the DB API contracts.
-- Return convention (standard):
--   o_status_code NUMBER
--     0   = success
--    -1   = validation error
--    -2   = duplicate / business rule failure
--    -99  = unexpected error
--   o_status_msg VARCHAR2(4000) (human-readable)

------------------------------------------------------------------------------------------------------------------
-- EMP_MASTER Procedures
------------------------------------------------------------------------------------------------------------------
-- PROC_SAVE_EMP_MASTER: insert new employee
PROCEDURE PROC_SAVE_EMP_MASTER(
  p_employee_id      IN  VARCHAR2,        -- application employee code
  p_employee_no      IN  VARCHAR2,        -- EMPNO (ERP key)
  p_employee_name    IN  VARCHAR2,        -- EMPNAME
  p_full_name        IN  VARCHAR2,        -- FULL_NAME
  p_company_id       IN  VARCHAR2,
  p_branch_id        IN  VARCHAR2,
  p_biometric_id     IN  VARCHAR2,
  p_erp_username     IN  VARCHAR2,
  p_api_username     IN  VARCHAR2,
  p_is_active        IN  CHAR,            -- 'T'/'F'
  p_inactive_date    IN  DATE,
  p_cancel           IN  CHAR,            -- 'T'/'F'
  p_createdby        IN  VARCHAR2,
  o_emp_id           OUT NUMBER,          -- generated EMP_ID
  o_status_code      OUT NUMBER,
  o_status_msg       OUT VARCHAR2
);

-- PROC_UPDATE_EMP_MASTER: update existing employee
PROCEDURE PROC_UPDATE_EMP_MASTER(
  p_emp_id           IN  NUMBER,
  p_employee_id      IN  VARCHAR2,
  p_employee_no      IN  VARCHAR2,
  p_employee_name    IN  VARCHAR2,
  p_full_name        IN  VARCHAR2,
  p_company_id       IN  VARCHAR2,
  p_branch_id        IN  VARCHAR2,
  p_biometric_id     IN  VARCHAR2,
  p_erp_username     IN  VARCHAR2,
  p_api_username     IN  VARCHAR2,
  p_is_active        IN  CHAR,
  p_inactive_date    IN  DATE,
  p_cancel           IN  CHAR,
  p_modifiedby       IN  VARCHAR2,
  o_status_code      OUT NUMBER,
  o_status_msg       OUT VARCHAR2
);

-- PROC_DEACTIVATE_EMP_MASTER: convenience for deactivate
PROCEDURE PROC_DEACTIVATE_EMP_MASTER(
  p_emp_id           IN  NUMBER,
  p_reason           IN  VARCHAR2,
  p_modifiedby       IN  VARCHAR2,
  o_status_code      OUT NUMBER,
  o_status_msg       OUT VARCHAR2
);

------------------------------------------------------------------------------------------------------------------
-- API_LINK_MASTER Procedures
------------------------------------------------------------------------------------------------------------------
-- PROC_VALIDATE_API_LINK: validation-only helper
PROCEDURE PROC_VALIDATE_API_LINK(
  p_erpusername      IN  VARCHAR2,
  p_apiusername      IN  VARCHAR2,
  o_status_code      OUT NUMBER,
  o_status_msg       OUT VARCHAR2
);

-- PROC_CREATE_API_LINK: create mapping
PROCEDURE PROC_CREATE_API_LINK(
  p_erpusername      IN  VARCHAR2,
  p_apiusername      IN  VARCHAR2,
  p_empname          IN  VARCHAR2,
  p_applicablefrom   IN  DATE,
  p_applicableto     IN  DATE,
  p_active           IN  CHAR,
  p_cancel           IN  CHAR,
  p_createdby        IN  VARCHAR2,
  o_id               OUT NUMBER,    -- API_LINK_MASTER_ID
  o_status_code      OUT NUMBER,
  o_status_msg       OUT VARCHAR2
);

-- PROC_UPDATE_API_LINK: update mapping
PROCEDURE PROC_UPDATE_API_LINK(
  p_id               IN  NUMBER,
  p_apiusername      IN  VARCHAR2,
  p_empname          IN  VARCHAR2,
  p_applicablefrom   IN  DATE,
  p_applicableto     IN  DATE,
  p_active           IN  CHAR,
  p_cancel           IN  CHAR,
  p_modifiedby       IN  VARCHAR2,
  o_status_code      OUT NUMBER,
  o_status_msg       OUT VARCHAR2
);

-- PROC_GET_API_LINK_LIST: returns REF CURSOR
PROCEDURE PROC_GET_API_LINK_LIST(
  p_erp_username     IN  VARCHAR2 DEFAULT NULL,
  p_limit            IN  NUMBER DEFAULT 100,
  p_offset           IN  NUMBER DEFAULT 0,
  p_cursor           OUT SYS_REFCURSOR,
  o_status_code      OUT NUMBER
);

-- PROC_SYNC_EMP_API_LINK: sync a single employee by EMPNO
PROCEDURE PROC_SYNC_EMP_API_LINK(
  p_empno            IN  VARCHAR2,
  p_user             IN  VARCHAR2,
  o_status_code      OUT NUMBER,
  o_status_msg       OUT VARCHAR2
);

-- PROC_SYNC_ALL_EMP_TO_API_LINK: batch sync
PROCEDURE PROC_SYNC_ALL_EMP_TO_API_LINK(
  p_user             IN  VARCHAR2,
  p_force            IN  CHAR DEFAULT 'F', -- 'T' to force resync
  o_inserted_count   OUT NUMBER,
  o_status_code      OUT NUMBER,
  o_status_msg       OUT VARCHAR2
);

------------------------------------------------------------------------------------------------------------------
-- USER_ROLES Procedures
------------------------------------------------------------------------------------------------------------------
PROCEDURE PROC_ADD_USER_ROLE(
  p_user_id          IN  VARCHAR2,
  p_role             IN  VARCHAR2,
  p_createdby        IN  VARCHAR2,
  o_status_code      OUT NUMBER,
  o_status_msg       OUT VARCHAR2
);

PROCEDURE PROC_REMOVE_USER_ROLE(
  p_user_id          IN  VARCHAR2,
  p_role             IN  VARCHAR2,
  p_modifiedby       IN  VARCHAR2,
  o_status_code      OUT NUMBER,
  o_status_msg       OUT VARCHAR2
);

------------------------------------------------------------------------------------------------------------------
-- ATTENDANCE (placeholders)
------------------------------------------------------------------------------------------------------------------
PROCEDURE PROC_RECORD_PUNCH(
  p_profile_id       IN  NUMBER,
  p_punch_time       IN  DATE,
  p_type             IN  VARCHAR2,
  p_createdby        IN  VARCHAR2,
  o_status_code      OUT NUMBER,
  o_status_msg       OUT VARCHAR2
);

PROCEDURE PROC_GET_PUNCHES(
  p_profile_id       IN  NUMBER,
  p_from             IN  DATE,
  p_to               IN  DATE,
  p_cursor           OUT SYS_REFCURSOR,
  o_status_code      OUT NUMBER
);

------------------------------------------------------------------------------------------------------------------
-- Standard error code documentation (no implementation here)
-- 0   = success
-- -1  = validation error (missing/invalid field)
-- -2  = business rule / duplicate / unique constraint
-- -99 = unexpected error (catch-all)
------------------------------------------------------------------------------------------------------------------

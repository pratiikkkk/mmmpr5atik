-- PL/SQL Procedure Skeletons (STEP 4)
-- File: db/plsql/01_procedure_skeletons.sql
-- NOTE: These are skeletons only. Do NOT implement heavy logic here.
--       Procedures should return status codes and messages via OUT parameters.
--       Follow ERP conventions: CHAR(1) flags ('T'/'F'), DATE for dates, NUMBER for ids.

-- Status codes: 0 = success, >0 = error code
-- Example usage: p_out_status := 0; p_out_msg := 'OK';

/*
PROC_SAVE_EMP_MASTER
- Purpose: Insert a new EMP_MASTER record (or return error if validation fails)
- IN params: fields for employee
- OUT params: status code, message, created id
- Behavior: validate inputs, set CREATEDON/CREATEDBY, return id
*/
CREATE OR REPLACE PROCEDURE PROC_SAVE_EMP_MASTER(
  p_employee_id      IN VARCHAR2,
  p_employee_no      IN VARCHAR2,
  p_employee_name    IN VARCHAR2,
  p_full_name        IN VARCHAR2,
  p_company_id       IN VARCHAR2,
  p_branch_id        IN VARCHAR2,
  p_biometric_id     IN VARCHAR2,
  p_erp_username     IN VARCHAR2,
  p_api_username     IN VARCHAR2,
  p_is_active        IN CHAR,
  p_inactive_date    IN DATE,
  p_cancel           IN CHAR,
  p_user             IN VARCHAR2,
  p_out_emp_id       OUT NUMBER,
  p_out_status       OUT NUMBER,
  p_out_msg          OUT VARCHAR2
) AS
BEGIN
  -- TODO: Validate inputs (e.g., api_username numeric when present)
  -- TODO: Insert into EMP_MASTER and set CREATEDON/CREATEDBY
  -- Example assignment:
  -- p_out_emp_id := <generated id>;
  p_out_status := 0; -- success
  p_out_msg := 'Not implemented: skeleton only';
EXCEPTION
  WHEN OTHERS THEN
    p_out_status := 100;
    p_out_msg := SQLERRM;
END PROC_SAVE_EMP_MASTER;
/

/*
PROC_UPDATE_EMP_MASTER
- Purpose: Update an existing EMP_MASTER row
- IN params: emp id and fields to update
- OUT params: status, message
*/
CREATE OR REPLACE PROCEDURE PROC_UPDATE_EMP_MASTER(
  p_emp_id           IN NUMBER,
  p_employee_id      IN VARCHAR2,
  p_employee_no      IN VARCHAR2,
  p_employee_name    IN VARCHAR2,
  p_full_name        IN VARCHAR2,
  p_company_id       IN VARCHAR2,
  p_branch_id        IN VARCHAR2,
  p_biometric_id     IN VARCHAR2,
  p_erp_username     IN VARCHAR2,
  p_api_username     IN VARCHAR2,
  p_is_active        IN CHAR,
  p_inactive_date    IN DATE,
  p_cancel           IN CHAR,
  p_user             IN VARCHAR2,
  p_out_status       OUT NUMBER,
  p_out_msg          OUT VARCHAR2
) AS
BEGIN
  -- TODO: Validate and perform update. Set MODIFIEDON/MODIFIEDBY
  p_out_status := 0;
  p_out_msg := 'Not implemented: skeleton only';
EXCEPTION
  WHEN OTHERS THEN
    p_out_status := 101;
    p_out_msg := SQLERRM;
END PROC_UPDATE_EMP_MASTER;
/

/*
PROC_SYNC_EMP_API_LINK
- Purpose: Sync a single employee (by empno) to API_LINK_MASTER (create or update mapping)
- Handles inactive -> mark mapping inactive
*/
CREATE OR REPLACE PROCEDURE PROC_SYNC_EMP_API_LINK(
  p_empno            IN VARCHAR2,
  p_user             IN VARCHAR2,
  p_out_status       OUT NUMBER,
  p_out_msg          OUT VARCHAR2
) AS
BEGIN
  -- TODO: Find EMP_MASTER by EMPNO, create/update API_LINK_MASTER accordingly
  p_out_status := 0;
  p_out_msg := 'Not implemented: skeleton only';
EXCEPTION
  WHEN OTHERS THEN
    p_out_status := 110;
    p_out_msg := SQLERRM;
END PROC_SYNC_EMP_API_LINK;
/

/*
PROC_SYNC_ALL_EMP_TO_API_LINK
- Purpose: Batch sync all employees from EMP_MASTER to API_LINK_MASTER
*/
CREATE OR REPLACE PROCEDURE PROC_SYNC_ALL_EMP_TO_API_LINK(
  p_user             IN VARCHAR2,
  p_out_status       OUT NUMBER,
  p_out_msg          OUT VARCHAR2
) AS
BEGIN
  -- TODO: Iterate employees and call PROC_SYNC_EMP_API_LINK or inline logic
  p_out_status := 0;
  p_out_msg := 'Not implemented: skeleton only';
EXCEPTION
  WHEN OTHERS THEN
    p_out_status := 111;
    p_out_msg := SQLERRM;
END PROC_SYNC_ALL_EMP_TO_API_LINK;
/

/*
PROC_GET_API_LINK_LIST
- Purpose: Return a cursor of API_LINK_MASTER rows optionally filtered by erp username
- OUT params: ref cursor, status
*/
CREATE OR REPLACE PROCEDURE PROC_GET_API_LINK_LIST(
  p_erp_username     IN VARCHAR2 DEFAULT NULL,
  p_limit            IN NUMBER DEFAULT 100,
  p_offset           IN NUMBER DEFAULT 0,
  p_cursor           OUT SYS_REFCURSOR,
  p_out_status       OUT NUMBER
) AS
BEGIN
  -- TODO: Open cursor with SELECT ... ORDER BY LINKDATE DESC
  OPEN p_cursor FOR
    SELECT * FROM API_LINK_MASTER
    WHERE (p_erp_username IS NULL OR ERPUSERNAME = p_erp_username)
    ORDER BY LINKDATE DESC;
  p_out_status := 0;
EXCEPTION
  WHEN OTHERS THEN
    p_out_status := 120;
    p_cursor := NULL;
END PROC_GET_API_LINK_LIST;
/

/*
PROC_VALIDATE_API_LINK
- Purpose: Validate an API link payload (e.g., numeric APIUSERNAME, uniqueness rules)
*/
CREATE OR REPLACE PROCEDURE PROC_VALIDATE_API_LINK(
  p_erpusername      IN VARCHAR2,
  p_apiusername      IN VARCHAR2,
  p_out_status       OUT NUMBER,
  p_out_msg          OUT VARCHAR2
) AS
BEGIN
  -- TODO: Validate numeric APIUSERNAME and that no other active mapping exists
  p_out_status := 0;
  p_out_msg := 'Not implemented: skeleton only';
EXCEPTION
  WHEN OTHERS THEN
    p_out_status := 130;
    p_out_msg := SQLERRM;
END PROC_VALIDATE_API_LINK;
/

/*
PROC_CREATE_API_LINK
- Purpose: Create a mapping in API_LINK_MASTER
*/
CREATE OR REPLACE PROCEDURE PROC_CREATE_API_LINK(
  p_erpusername      IN VARCHAR2,
  p_apiusername      IN VARCHAR2,
  p_empname          IN VARCHAR2,
  p_applicablefrom   IN DATE,
  p_applicableto     IN DATE,
  p_active           IN CHAR,
  p_cancel           IN CHAR,
  p_user             IN VARCHAR2,
  p_out_id           OUT NUMBER,
  p_out_status       OUT NUMBER,
  p_out_msg          OUT VARCHAR2
) AS
BEGIN
  -- TODO: Validate using PROC_VALIDATE_API_LINK, then insert and set LINKNO if needed
  p_out_status := 0;
  p_out_msg := 'Not implemented: skeleton only';
EXCEPTION
  WHEN OTHERS THEN
    p_out_status := 140;
    p_out_msg := SQLERRM;
END PROC_CREATE_API_LINK;
/

/*
PROC_UPDATE_API_LINK
- Purpose: Update mapping by id
*/
CREATE OR REPLACE PROCEDURE PROC_UPDATE_API_LINK(
  p_id               IN NUMBER,
  p_apiusername      IN VARCHAR2,
  p_empname          IN VARCHAR2,
  p_applicablefrom   IN DATE,
  p_applicableto     IN DATE,
  p_active           IN CHAR,
  p_cancel           IN CHAR,
  p_user             IN VARCHAR2,
  p_out_status       OUT NUMBER,
  p_out_msg          OUT VARCHAR2
) AS
BEGIN
  -- TODO: Validate and perform update
  p_out_status := 0;
  p_out_msg := 'Not implemented: skeleton only';
EXCEPTION
  WHEN OTHERS THEN
    p_out_status := 141;
    p_out_msg := SQLERRM;
END PROC_UPDATE_API_LINK;
/
-- End of skeletons
PROMPT 'PL/SQL skeletons created: db/plsql/01_procedure_skeletons.sql'

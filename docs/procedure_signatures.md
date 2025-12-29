# Procedure Signatures (Human-readable)

This is a human-readable reference of the finalized PL/SQL procedure signatures and return convention.

Return convention
- o_status_code NUMBER
  - 0   = success
  - -1  = validation error
  - -2  = duplicate / business rule
  - -99 = unexpected error
- o_status_msg VARCHAR2(4000) (human-readable)

EMP_MASTER Procedures
- PROC_SAVE_EMP_MASTER(
    p_employee_id IN VARCHAR2,
    p_employee_no IN VARCHAR2,
    p_employee_name IN VARCHAR2,
    p_full_name IN VARCHAR2,
    p_company_id IN VARCHAR2,
    p_branch_id IN VARCHAR2,
    p_biometric_id IN VARCHAR2,
    p_erp_username IN VARCHAR2,
    p_api_username IN VARCHAR2,
    p_is_active IN CHAR,
    p_inactive_date IN DATE,
    p_cancel IN CHAR,
    p_createdby IN VARCHAR2,
    o_emp_id OUT NUMBER,
    o_status_code OUT NUMBER,
    o_status_msg OUT VARCHAR2
  )

- PROC_UPDATE_EMP_MASTER(...)
- PROC_DEACTIVATE_EMP_MASTER(...)

API_LINK_MASTER Procedures
- PROC_VALIDATE_API_LINK(p_erpusername IN VARCHAR2, p_apiusername IN VARCHAR2, o_status_code OUT NUMBER, o_status_msg OUT VARCHAR2)
- PROC_CREATE_API_LINK(..., o_id OUT NUMBER, o_status_code OUT NUMBER, o_status_msg OUT VARCHAR2)
- PROC_UPDATE_API_LINK(...)
- PROC_GET_API_LINK_LIST(p_erp_username IN VARCHAR2 DEFAULT NULL, p_limit IN NUMBER DEFAULT 100, p_offset IN NUMBER DEFAULT 0, p_cursor OUT SYS_REFCURSOR, o_status_code OUT NUMBER)
- PROC_SYNC_EMP_API_LINK(p_empno IN VARCHAR2, p_user IN VARCHAR2, o_status_code OUT NUMBER, o_status_msg OUT VARCHAR2)
- PROC_SYNC_ALL_EMP_TO_API_LINK(p_user IN VARCHAR2, p_force IN CHAR DEFAULT 'F', o_inserted_count OUT NUMBER, o_status_code OUT NUMBER, o_status_msg OUT VARCHAR2)

USER_ROLES Procedures
- PROC_ADD_USER_ROLE(p_user_id IN VARCHAR2, p_role IN VARCHAR2, p_createdby IN VARCHAR2, o_status_code OUT NUMBER, o_status_msg OUT VARCHAR2)
- PROC_REMOVE_USER_ROLE(...)

ATTENDANCE placeholders
- PROC_RECORD_PUNCH(...)
- PROC_GET_PUNCHES(...)

Notes/Assumptions
- VARCHAR2 sizes follow DDL suggestions in db/ddl/01_create_tables.sql
- Date fields are DATE, not TIMESTAMP (ERP rule)
- CHAR(1) used for boolean-like flags ('T'/'F')

Next step
- Once you confirm these signatures I will produce PL/SQL package skeletons (one package per domain) and then we will define the Node.js route specs to call them.

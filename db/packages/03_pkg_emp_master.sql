-- 03_pkg_emp_master.sql
-- Package: PKG_EMP_MASTER (skeletons only)
-- Purpose: Encapsulate EMP_MASTER operations. Bodies return NOT IMPLEMENTED status by default.

CREATE OR REPLACE PACKAGE PKG_EMP_MASTER IS
  PROCEDURE PROC_SAVE_EMP_MASTER(
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
    p_createdby        IN  VARCHAR2,
    o_emp_id           OUT NUMBER,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  );

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

  PROCEDURE PROC_DEACTIVATE_EMP_MASTER(
    p_emp_id           IN  NUMBER,
    p_reason           IN  VARCHAR2,
    p_modifiedby       IN  VARCHAR2,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  );

  PROCEDURE PROC_GET_EMP_BY_EMPNO(
    p_empno            IN  VARCHAR2,
    o_emp_id           OUT NUMBER,
    o_empname          OUT VARCHAR2,
    o_erp_username     OUT VARCHAR2,
    o_api_username     OUT VARCHAR2,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  );
END PKG_EMP_MASTER;
/
CREATE OR REPLACE PACKAGE BODY PKG_EMP_MASTER IS

  PROCEDURE PROC_SAVE_EMP_MASTER(
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
    p_createdby        IN  VARCHAR2,
    o_emp_id           OUT NUMBER,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  ) IS
  BEGIN
    o_status_code := -99;
    o_status_msg  := 'NOT IMPLEMENTED: PROC_SAVE_EMP_MASTER';
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    o_status_msg  := SQLERRM;
  END PROC_SAVE_EMP_MASTER;

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
  ) IS
  BEGIN
    o_status_code := -99;
    o_status_msg  := 'NOT IMPLEMENTED: PROC_UPDATE_EMP_MASTER';
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    o_status_msg  := SQLERRM;
  END PROC_UPDATE_EMP_MASTER;

  PROCEDURE PROC_DEACTIVATE_EMP_MASTER(
    p_emp_id           IN  NUMBER,
    p_reason           IN  VARCHAR2,
    p_modifiedby       IN  VARCHAR2,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  ) IS
  BEGIN
    o_status_code := -99;
    o_status_msg  := 'NOT IMPLEMENTED: PROC_DEACTIVATE_EMP_MASTER';
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    o_status_msg  := SQLERRM;
  END PROC_DEACTIVATE_EMP_MASTER;

  PROCEDURE PROC_GET_EMP_BY_EMPNO(
    p_empno            IN  VARCHAR2,
    o_emp_id           OUT NUMBER,
    o_empname          OUT VARCHAR2,
    o_erp_username     OUT VARCHAR2,
    o_api_username     OUT VARCHAR2,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  ) IS
  BEGIN
    o_status_code := -99;
    o_status_msg  := 'NOT IMPLEMENTED: PROC_GET_EMP_BY_EMPNO';
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    o_status_msg  := SQLERRM;
  END PROC_GET_EMP_BY_EMPNO;

END PKG_EMP_MASTER;
/
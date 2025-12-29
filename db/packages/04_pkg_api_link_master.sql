-- 04_pkg_api_link_master.sql
-- Package: PKG_API_LINK_MASTER (skeletons only)
-- Purpose: Encapsulate API_LINK_MASTER operations. Bodies return NOT IMPLEMENTED status by default.

CREATE OR REPLACE PACKAGE PKG_API_LINK_MASTER IS
  PROCEDURE PROC_VALIDATE_API_LINK(
    p_erpusername      IN  VARCHAR2,
    p_apiusername      IN  VARCHAR2,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  );

  PROCEDURE PROC_CREATE_API_LINK(
    p_erpusername      IN  VARCHAR2,
    p_apiusername      IN  VARCHAR2,
    p_empname          IN  VARCHAR2,
    p_applicablefrom   IN  DATE,
    p_applicableto     IN  DATE,
    p_active           IN  CHAR,
    p_cancel           IN  CHAR,
    p_createdby        IN  VARCHAR2,
    o_id               OUT NUMBER,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  );

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

  PROCEDURE PROC_GET_API_LINK_LIST(
    p_erp_username     IN  VARCHAR2 DEFAULT NULL,
    p_limit            IN  NUMBER DEFAULT 100,
    p_offset           IN  NUMBER DEFAULT 0,
    p_cursor           OUT SYS_REFCURSOR,
    o_status_code      OUT NUMBER
  );

  PROCEDURE PROC_SYNC_EMP_API_LINK(
    p_empno            IN  VARCHAR2,
    p_user             IN  VARCHAR2,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  );

  PROCEDURE PROC_SYNC_ALL_EMP_TO_API_LINK(
    p_user             IN  VARCHAR2,
    p_force            IN  CHAR DEFAULT 'F',
    o_inserted_count   OUT NUMBER,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  );
END PKG_API_LINK_MASTER;
/
CREATE OR REPLACE PACKAGE BODY PKG_API_LINK_MASTER IS

  PROCEDURE PROC_VALIDATE_API_LINK(
    p_erpusername      IN  VARCHAR2,
    p_apiusername      IN  VARCHAR2,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  ) IS
  BEGIN
    o_status_code := -99;
    o_status_msg  := 'NOT IMPLEMENTED: PROC_VALIDATE_API_LINK';
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    o_status_msg  := SQLERRM;
  END PROC_VALIDATE_API_LINK;

  PROCEDURE PROC_CREATE_API_LINK(
    p_erpusername      IN  VARCHAR2,
    p_apiusername      IN  VARCHAR2,
    p_empname          IN  VARCHAR2,
    p_applicablefrom   IN  DATE,
    p_applicableto     IN  DATE,
    p_active           IN  CHAR,
    p_cancel           IN  CHAR,
    p_createdby        IN  VARCHAR2,
    o_id               OUT NUMBER,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  ) IS
  BEGIN
    o_status_code := -99;
    o_status_msg  := 'NOT IMPLEMENTED: PROC_CREATE_API_LINK';
    o_id := NULL;
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    o_status_msg  := SQLERRM;
    o_id := NULL;
  END PROC_CREATE_API_LINK;

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
  ) IS
  BEGIN
    o_status_code := -99;
    o_status_msg  := 'NOT IMPLEMENTED: PROC_UPDATE_API_LINK';
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    o_status_msg  := SQLERRM;
  END PROC_UPDATE_API_LINK;

  PROCEDURE PROC_GET_API_LINK_LIST(
    p_erp_username     IN  VARCHAR2 DEFAULT NULL,
    p_limit            IN  NUMBER DEFAULT 100,
    p_offset           IN  NUMBER DEFAULT 0,
    p_cursor           OUT SYS_REFCURSOR,
    o_status_code      OUT NUMBER
  ) IS
  BEGIN
    o_status_code := -99;
    p_cursor := NULL;
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    p_cursor := NULL;
  END PROC_GET_API_LINK_LIST;

  PROCEDURE PROC_SYNC_EMP_API_LINK(
    p_empno            IN  VARCHAR2,
    p_user             IN  VARCHAR2,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  ) IS
  BEGIN
    o_status_code := -99;
    o_status_msg  := 'NOT IMPLEMENTED: PROC_SYNC_EMP_API_LINK';
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    o_status_msg  := SQLERRM;
  END PROC_SYNC_EMP_API_LINK;

  PROCEDURE PROC_SYNC_ALL_EMP_TO_API_LINK(
    p_user             IN  VARCHAR2,
    p_force            IN  CHAR DEFAULT 'F',
    o_inserted_count   OUT NUMBER,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  ) IS
  BEGIN
    o_inserted_count := 0;
    o_status_code := -99;
    o_status_msg  := 'NOT IMPLEMENTED: PROC_SYNC_ALL_EMP_TO_API_LINK';
  EXCEPTION WHEN OTHERS THEN
    o_inserted_count := 0;
    o_status_code := -99;
    o_status_msg  := SQLERRM;
  END PROC_SYNC_ALL_EMP_TO_API_LINK;

END PKG_API_LINK_MASTER;
/
-- 06_pkg_user_roles.sql
-- Package: PKG_USER_ROLES (skeletons only)
-- Purpose: Manage user roles

CREATE OR REPLACE PACKAGE PKG_USER_ROLES IS
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

  PROCEDURE PROC_GET_USER_ROLES(
    p_user_id          IN  VARCHAR2,
    p_cursor           OUT SYS_REFCURSOR,
    o_status_code      OUT NUMBER
  );
END PKG_USER_ROLES;
/
CREATE OR REPLACE PACKAGE BODY PKG_USER_ROLES IS

  PROCEDURE PROC_ADD_USER_ROLE(
    p_user_id          IN  VARCHAR2,
    p_role             IN  VARCHAR2,
    p_createdby        IN  VARCHAR2,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  ) IS
  BEGIN
    o_status_code := -99;
    o_status_msg  := 'NOT IMPLEMENTED: PROC_ADD_USER_ROLE';
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    o_status_msg  := SQLERRM;
  END PROC_ADD_USER_ROLE;

  PROCEDURE PROC_REMOVE_USER_ROLE(
    p_user_id          IN  VARCHAR2,
    p_role             IN  VARCHAR2,
    p_modifiedby       IN  VARCHAR2,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  ) IS
  BEGIN
    o_status_code := -99;
    o_status_msg  := 'NOT IMPLEMENTED: PROC_REMOVE_USER_ROLE';
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    o_status_msg  := SQLERRM;
  END PROC_REMOVE_USER_ROLE;

  PROCEDURE PROC_GET_USER_ROLES(
    p_user_id          IN  VARCHAR2,
    p_cursor           OUT SYS_REFCURSOR,
    o_status_code      OUT NUMBER
  ) IS
  BEGIN
    o_status_code := -99;
    p_cursor := NULL;
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    p_cursor := NULL;
  END PROC_GET_USER_ROLES;

END PKG_USER_ROLES;
/
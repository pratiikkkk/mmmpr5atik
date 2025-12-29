-- 05_pkg_attendance.sql
-- Package: PKG_ATTENDANCE (skeletons only)
-- Purpose: Attendance-related procedures (placeholders)

CREATE OR REPLACE PACKAGE PKG_ATTENDANCE IS
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
END PKG_ATTENDANCE;
/
CREATE OR REPLACE PACKAGE BODY PKG_ATTENDANCE IS

  PROCEDURE PROC_RECORD_PUNCH(
    p_profile_id       IN  NUMBER,
    p_punch_time       IN  DATE,
    p_type             IN  VARCHAR2,
    p_createdby        IN  VARCHAR2,
    o_status_code      OUT NUMBER,
    o_status_msg       OUT VARCHAR2
  ) IS
  BEGIN
    o_status_code := -99;
    o_status_msg  := 'NOT IMPLEMENTED: PROC_RECORD_PUNCH';
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    o_status_msg  := SQLERRM;
  END PROC_RECORD_PUNCH;

  PROCEDURE PROC_GET_PUNCHES(
    p_profile_id       IN  NUMBER,
    p_from             IN  DATE,
    p_to               IN  DATE,
    p_cursor           OUT SYS_REFCURSOR,
    o_status_code      OUT NUMBER
  ) IS
  BEGIN
    o_status_code := -99;
    p_cursor := NULL;
  EXCEPTION WHEN OTHERS THEN
    o_status_code := -99;
    p_cursor := NULL;
  END PROC_GET_PUNCHES;

END PKG_ATTENDANCE;
/
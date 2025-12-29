-- 07_pkg_util_errors.sql
-- Package: PKG_UTIL_ERRORS (utility package for error messages and codes)

CREATE OR REPLACE PACKAGE PKG_UTIL_ERRORS IS
  FUNCTION GET_MSG(p_code IN NUMBER) RETURN VARCHAR2;
END PKG_UTIL_ERRORS;
/
CREATE OR REPLACE PACKAGE BODY PKG_UTIL_ERRORS IS
  FUNCTION GET_MSG(p_code IN NUMBER) RETURN VARCHAR2 IS
  BEGIN
    IF p_code = 0 THEN
      RETURN 'OK';
    ELSIF p_code = -1 THEN
      RETURN 'Validation error';
    ELSIF p_code = -2 THEN
      RETURN 'Business rule violation';
    ELSIF p_code = -99 THEN
      RETURN 'Not implemented or unexpected error';
    ELSE
      RETURN 'Unknown error code';
    END IF;
  END GET_MSG;
END PKG_UTIL_ERRORS;
/
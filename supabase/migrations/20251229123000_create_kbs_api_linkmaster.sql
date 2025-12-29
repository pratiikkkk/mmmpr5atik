-- Add erp_username and api_username to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS erp_username text,
  ADD COLUMN IF NOT EXISTS api_username text;

-- Create sequence for kbs_api_linkmaster IDs (if not exists)
CREATE SEQUENCE IF NOT EXISTS public.seq_kbs_api_linkmaster START 1;

-- Create table kbs_api_linkmaster
CREATE TABLE IF NOT EXISTS public.kbs_api_linkmaster (
  kbs_api_linkmasterid bigint PRIMARY KEY DEFAULT nextval('public.seq_kbs_api_linkmaster'),
  linkdate timestamp with time zone NOT NULL DEFAULT now(),
  linkno text NOT NULL,
  erpusername text NOT NULL,
  apiusername text,
  empname text,
  applicablefrom date,
  applicableto date,
  active char(1) NOT NULL DEFAULT 'T',
  cancel char(1) NOT NULL DEFAULT 'F',
  createdon timestamp with time zone NOT NULL DEFAULT now(),
  createdby text,
  modifiedon timestamp with time zone
);

-- Ensure ERP username unique for active/non-cancelled rows
CREATE UNIQUE INDEX IF NOT EXISTS ux_kbs_api_linkmaster_erp_active
ON public.kbs_api_linkmaster (erpusername)
WHERE (cancel <> 'T' AND active = 'T');

-- Ensure API username is numeric when present
ALTER TABLE public.kbs_api_linkmaster
  ADD CONSTRAINT chk_kbs_api_linkmaster_apiusername_numeric CHECK (apiusername IS NULL OR apiusername ~ '^[0-9]+$');

-- Function to set linkno on insert (using the id)
CREATE OR REPLACE FUNCTION public.set_kbs_api_linkmaster_linkno() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.linkno IS NULL OR NEW.linkno = '' THEN
    NEW.linkno := 'KTV/API/' || NEW.kbs_api_linkmasterid;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_linkno
BEFORE INSERT ON public.kbs_api_linkmaster
FOR EACH ROW
EXECUTE FUNCTION public.set_kbs_api_linkmaster_linkno();

-- Sync trigger: when profiles are inserted or updated, ensure kbs_api_linkmaster is created/updated
CREATE OR REPLACE FUNCTION public.sync_profiles_to_kbs_linkmaster() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  cnt int;
  existing_id bigint;
BEGIN
  -- Only proceed if erp_username is set
  IF NEW.erp_username IS NULL OR trim(NEW.erp_username) = '' THEN
    RETURN NEW;
  END IF;

  -- If employee became inactive, set active='F' for their mappings (do not delete)
  IF NEW.is_active = FALSE THEN
    UPDATE public.kbs_api_linkmaster
    SET active = 'F', modifiedon = now()
    WHERE erpusername = NEW.erp_username AND cancel <> 'T';
    RETURN NEW;
  END IF;

  SELECT kbs_api_linkmasterid INTO existing_id
  FROM public.kbs_api_linkmaster
  WHERE erpusername = NEW.erp_username AND cancel <> 'T'
  LIMIT 1;

  IF existing_id IS NULL THEN
    -- Insert new mapping
    INSERT INTO public.kbs_api_linkmaster(
      kbs_api_linkmasterid, linkdate, linkno, erpusername, apiusername, empname, active, createdon, createdby
    ) VALUES (
      nextval('public.seq_kbs_api_linkmaster'), now(), NULL, NEW.erp_username, NEW.api_username, NEW.full_name, 'T', now(), current_user
    );
    -- set linkno using trigger set_kbs_api_linkmaster_linkno
  ELSE
    -- Update existing mapping
    UPDATE public.kbs_api_linkmaster
    SET apiusername = NEW.api_username,
        empname = NEW.full_name,
        modifiedon = now()
    WHERE kbs_api_linkmasterid = existing_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profiles_to_kbs_linkmaster ON public.profiles;
CREATE TRIGGER trg_sync_profiles_to_kbs_linkmaster
AFTER INSERT OR UPDATE OF erp_username, api_username, full_name, is_active ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profiles_to_kbs_linkmaster();

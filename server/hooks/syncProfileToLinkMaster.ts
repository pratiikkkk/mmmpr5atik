// Example server-side hook (Node) to run after profile create/update to maintain kbs_api_linkmaster
// Use this instead of DB trigger if you prefer app-layer control.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export async function syncProfileToLinkMaster(profile: any) {
  if (!profile?.erp_username) return;
  try {
    // If employee inactive -> set active='F'
    if (profile.is_active === false) {
      await supabase.from('kbs_api_linkmaster').update({ active: 'F', modifiedon: new Date().toISOString() }).eq('erpusername', profile.erp_username);
      return;
    }

    // Check existing
    const { data: existing } = await supabase.from('kbs_api_linkmaster').select('*').eq('erpusername', profile.erp_username).maybeSingle();
    if (existing) {
      await supabase.from('kbs_api_linkmaster').update({ apiusername: profile.api_username, empname: profile.full_name, modifiedon: new Date().toISOString() }).eq('kbs_api_linkmasterid', existing.kbs_api_linkmasterid);
    } else {
      await supabase.from('kbs_api_linkmaster').insert({ erpusername: profile.erp_username, apiusername: profile.api_username, empname: profile.full_name, active: 'T' });
    }
  } catch (err) {
    console.error('Failed to sync profile to linkmaster', err);
    throw err;
  }
}

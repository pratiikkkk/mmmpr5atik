import { listLinkMaster, createLinkMaster, updateLinkMaster } from '@/lib/adminApi';

export async function syncProfileToLinkMaster(profile: any) {
  if (!profile?.erp_username) return { synced: false, reason: 'missing_erp' };

  const all = await listLinkMaster();
  const existing = (all || []).find((l: any) => l.erpusername === profile.erp_username);
  const payload = {
    erpusername: profile.erp_username,
    apiusername: profile.api_username,
    empname: profile.full_name,
    active: profile.is_active === false ? 'F' : 'T',
  };
  if (existing) {
    await updateLinkMaster(existing.kbs_api_linkmasterid, payload);
    return { synced: true, action: 'updated' };
  } else {
    await createLinkMaster(payload);
    return { synced: true, action: 'created' };
  }
}

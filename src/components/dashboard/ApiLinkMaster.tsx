import { useState, useEffect } from 'react';
import GlassForm from '@/components/ui/GlassForm';
import { Link as LinkIcon, Loader2 } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { useLinkMasters, useCreateLinkMaster, useUpdateLinkMaster, useLinkMasterByERP } from '@/hooks/useLinkMaster';
import { useQueryClient } from '@tanstack/react-query';

interface Props { onToast: (msg: string, type: 'success' | 'error') => void }

const ApiLinkMaster = ({ onToast }: Props) => {
  const { data: profiles = [] } = useProfiles();
  const linkMastersQuery = useLinkMasters();
  const linkmasters = linkMastersQuery.data || [];
  const createMutation = useCreateLinkMaster();
  const updateMutation = useUpdateLinkMaster();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const selectedProfile = profiles.find((p: any) => p.id === selectedProfileId) || null;

  const [applicableFrom, setApplicableFrom] = useState<string>('');
  const [applicableTo, setApplicableTo] = useState<string>('');
  const [active, setActive] = useState<boolean>(true);

  // inline validation errors
  const [errors, setErrors] = useState<{ employee?: string; erp?: string; api?: string; from?: string }>({});

  // sync status: 'unknown' | 'checking' | 'synced' | 'not-synced'
  const [syncStatus, setSyncStatus] = useState<'unknown' | 'checking' | 'synced' | 'not-synced'>('unknown');
  const [syncMessage, setSyncMessage] = useState<string>('');

  const { data: existingForERP } = useLinkMasterByERP(selectedProfile?.erp_username);
  const [syncRunning, setSyncRunning] = useState(false);

  useEffect(() => {
    if (existingForERP) {
      setApplicableFrom(existingForERP.applicablefrom || '');
      setApplicableTo(existingForERP.applicableto || '');
      setActive(existingForERP.active === 'T');
    } else {
      setApplicableFrom('');
      setApplicableTo('');
      setActive(true);
    }
  }, [existingForERP]);

  // Run sync from Employee Master (on open and manually)
  const runSyncFromEmpMaster = async () => {
    setSyncRunning(true);
    setSyncStatus('checking');
    setSyncMessage('Syncing from Employee Master');
    try {
      const resp = await fetch('/api/admin/sync-emp-to-linkmaster', { method: 'POST' });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        setSyncStatus('not-synced');
        setSyncMessage(body?.error || 'Sync endpoint error');
        setSyncRunning(false);
        return;
      }
      const body = await resp.json();
      // refresh local list to show inserted mappings
      if (linkMastersQuery.refetch) {
        await linkMastersQuery.refetch();
      }
      setSyncStatus('synced');
      setSyncMessage(`Inserted ${body.insertedCount || 0} records`);
    } catch (err: any) {
      setSyncStatus('not-synced');
      setSyncMessage(err?.message || 'Network error');
    } finally {
      setSyncRunning(false);
    }
  };

  // run sync on mount so the table is populated from emp_master
  useEffect(() => {
    runSyncFromEmpMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // check admin API for sync status when profile changes (keep lightweight)
  useEffect(() => {
    async function checkStatus() {
      if (!selectedProfile?.erp_username) {
        setSyncStatus('unknown');
        setSyncMessage('No employee selected');
        return;
      }

      // Only keep a quick status by checking local query cache
      // try using local query data first
      const cached = linkMastersQuery.data as any[] | undefined;
      if (cached) {
        const existing = cached.find((l: any) => l.erpusername === selectedProfile.erp_username);
        if (existing) {
          setSyncStatus('synced');
          setSyncMessage('Mapping exists');
          return;
        }
        setSyncStatus('not-synced');
        setSyncMessage('Mapping not found');
        return;
      }

      // fall back to checking server endpoint
      setSyncStatus('checking');
      setSyncMessage('Checking sync status');
      try {
        const resp = await fetch('/api/admin/linkmaster');
        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          setSyncStatus('not-synced');
          setSyncMessage(body?.error || 'Admin API error');
          return;
        }
        const data = await resp.json();
        const existing = (data || []).find((l: any) => l.erpusername === selectedProfile.erp_username);
        if (existing) {
          setSyncStatus('synced');
          setSyncMessage('Mapping exists');
        } else {
          setSyncStatus('not-synced');
          setSyncMessage('Mapping not found');
        }
      } catch (err: any) {
        setSyncStatus('not-synced');
        setSyncMessage(err?.message || 'Network error');
      }
    }

    checkStatus();
  }, [selectedProfile?.erp_username]);

  const validate = () => {
    const newErrors: any = {};
    if (!selectedProfile) {
      newErrors.employee = 'Select an employee';
    }
    if (!selectedProfile?.erp_username) {
      newErrors.erp = 'ERP Username is required';
    }
    if (!selectedProfile?.api_username) {
      newErrors.api = 'API Username is required';
    } else if (!/^[0-9]+$/.test(String(selectedProfile.api_username))) {
      newErrors.api = 'API Username must be numeric';
    }

    if (!applicableFrom) {
      newErrors.from = 'From date is required';
    }

    if (applicableFrom && applicableTo && new Date(applicableFrom) > new Date(applicableTo)) {
      newErrors.from = 'Applicable From must be <= Applicable To';
    }

    // One active mapping per employee
    if (!existingForERP && selectedProfile?.erp_username && linkmasters.some((l: any) => l.erpusername === selectedProfile.erp_username && l.active === 'T' && l.cancel !== 'T')) {
      newErrors.erp = 'An active mapping already exists for this ERP username';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      // show first error as toast too for visibility
      const first = Object.values(newErrors)[0] as string;
      onToast(first, 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    // For now, Save is a sync from Employee Master (temporary behavior)
    if (!validate()) return;

    try {
      await runSyncFromEmpMaster();
      onToast('Auto-managed from Employee Master', 'success');
    } catch (err: any) {
      onToast(err?.message || 'Failed to sync from Employee Master', 'error');
    }
  };

  const [viewMode, setLocalViewMode] = useState<'FORM' | 'LIST'>('FORM');

  const setViewMode = async (mode: 'FORM' | 'LIST') => {
    if (mode === 'FORM') {
      // New Record should be disabled; inform the user
      onToast('Records auto-created from Employee Master', 'info');
      return;
    }
    // LIST: refresh data first
    await runSyncFromEmpMaster();
    setLocalViewMode('LIST');
  };

  return (
    <GlassForm title="ERP & API Username Linking Master" icon={LinkIcon} subtitle="Link employee ERP/API usernames" viewMode={viewMode} setViewMode={setViewMode} handleSave={handleSave} isEditing={false} onReset={() => { setSelectedProfileId(null); setApplicableFrom(''); setApplicableTo(''); setActive(true); }} isSaving={syncRunning}>
      <div className="space-y-6">
          <div className="flex justify-end items-center gap-3">
            {syncStatus === 'checking' ? (
              <div className="flex items-center text-xs text-muted-foreground" title={syncMessage}>
                <Loader2 size={14} className="animate-spin" />
                <span className="ml-2">Checking sync</span>
              </div>
            ) : (
              <div
                className={`text-xs font-bold ${syncStatus === 'synced' ? 'text-success' : 'text-warning'}`}
                title={syncMessage || (syncStatus === 'synced' ? 'Mapping exists' : 'Mapping not synced')}
              >
                {syncStatus === 'synced' ? '✅ Synced' : syncStatus === 'not-synced' ? '⚠️ Not synced' : ''}
              </div>
            )}
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div>
            <label className="label-text">Employee (LOV)</label>
            <select className="glass-input" value={selectedProfileId || ''} onChange={(e) => { setSelectedProfileId(e.target.value || null); setErrors((s) => ({ ...s, employee: undefined })); }}>
              <option value="">Select Employee</option>
              {profiles.map((p: any) => (
                <option key={p.id} value={p.id}>{p.full_name} - {p.employee_id}</option>
              ))}
            </select>
            {errors.employee && <div className="text-xs text-destructive mt-1">{errors.employee}</div>}          </div>
          <div>
            <label className="label-text">ERP Username</label>
            <input readOnly value={selectedProfile?.erp_username || ''} className="glass-input cursor-not-allowed opacity-50" />
            {errors.erp && <div className="text-xs text-destructive mt-1">{errors.erp}</div>}
          </div>

          <div>
            <label className="label-text">API Username</label>
            <input readOnly value={selectedProfile?.api_username || ''} className="glass-input cursor-not-allowed opacity-50" />
            {errors.api && <div className="text-xs text-destructive mt-1">{errors.api}</div>}
          </div>

          <div>
            <label className="label-text">Link Date</label>
            <input readOnly value={existingForERP?.linkdate ? new Date(existingForERP.linkdate).toLocaleString() : new Date().toLocaleString()} className="glass-input cursor-not-allowed opacity-50" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          <div>
            <label className="label-text">Link No</label>
            <input readOnly value={existingForERP?.linkno || 'Auto-generated after save'} className="glass-input cursor-not-allowed opacity-50" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="label-text">Employee Name</label>
            <input readOnly value={selectedProfile?.full_name || ''} className="glass-input cursor-not-allowed opacity-50" />
          </div>

          <div>
            <label className="label-text">Applicable From</label>
            <input type="date" value={applicableFrom} onChange={(e) => { setApplicableFrom(e.target.value); setErrors((s) => ({ ...s, from: undefined })); }} className="glass-input" />
            {errors.from && <div className="text-xs text-destructive mt-1">{errors.from}</div>}
          </div>

          <div>
            <label className="label-text">Applicable To</label>
            <input type="date" value={applicableTo} onChange={(e) => setApplicableTo(e.target.value)} className="glass-input" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="label-text">Active</label>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        </div>

        <div className="flex gap-2">
          <button className="btn bg-primary text-primary-foreground" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>{createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}</button>
          <button className="btn" onClick={() => { setSelectedProfileId(null); setApplicableFrom(''); setApplicableTo(''); setActive(true); }}>Reset</button>
        </div>

        <div className="pt-4">
          <h4 className="text-sm font-bold">Existing mappings</h4>
          <div className="mt-2 space-y-1 text-sm">
            {linkmasters.length ? (
              linkmasters.map((l: any) => (
                <div key={l.kbs_api_linkmasterid} className="p-2 border rounded">
                  <div><strong>{l.linkno}</strong> — {l.erpusername} → {l.apiusername} ({l.empname})</div>
                  <div className="text-xs text-muted-foreground">Applicable: {l.applicablefrom || '-'} to {l.applicableto || '-' } • Active: {l.active}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground">No mappings</div>
            )}
          </div>
        </div>
      </div>
    </GlassForm>
  );
};

export default ApiLinkMaster;

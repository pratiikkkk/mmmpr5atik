import { useState, useEffect } from 'react';
import { UserPlus, Calendar, MoreHorizontal } from 'lucide-react';
import GlassForm from '@/components/ui/GlassForm';
import DataTable from '@/components/ui/DataTable';
import { useProfiles, useUpdateProfile, useCreateProfile, useProfilesHasApiUsername } from '@/hooks/useProfiles';
import { useCompanies } from '@/hooks/useCompanies';
import { useBranches } from '@/hooks/useBranches';
import { useSetUserRoles, useUserRoles } from '@/hooks/useUserRoles';
import PasswordModal from '@/components/ui/PasswordModal';
import { createUserForProfile, resetPasswordForUser } from '@/lib/adminApi';
import { syncProfileToLinkMaster } from '@/lib/linkSync';
import { useQueryClient } from '@tanstack/react-query';

interface EmployeeMasterProps {
  onToast: (message: string, type: 'success' | 'error') => void;
}

const EmployeeMaster = ({ onToast }: EmployeeMasterProps) => {
  const [viewMode, setViewMode] = useState<'FORM' | 'LIST'>('FORM');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [empCompany, setEmpCompany] = useState('');
  const [empBranch, setEmpBranch] = useState('');
  const [empName, setEmpName] = useState('');
  const [empGender, setEmpGender] = useState('Male');
  const [empBioId, setEmpBioId] = useState('');
  const [empErpId, setEmpErpId] = useState('');
  const [empApiUserId, setEmpApiUserId] = useState('');
  const [empIsInactive, setEmpIsInactive] = useState(false);
  const [empInactDate, setEmpInactDate] = useState('');
  const [empRoles, setEmpRoles] = useState<string[]>([]);
  const [empLogin, setEmpLogin] = useState('');
  const [passwordModal, setPasswordModal] = useState<{ open: boolean; mode: 'create' | 'reset' }>({ open: false, mode: 'create' });
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useProfiles();
  const { data: hasApiUsername } = useProfilesHasApiUsername();
  const { data: companies = [] } = useCompanies();
  const { data: allBranches = [] } = useBranches();
  const updateMutation = useUpdateProfile();
  const createMutation = useCreateProfile();
  const setUserRolesMutation = useSetUserRoles();

  const filteredBranches = empCompany
    ? allBranches.filter((b) => b.company_id === empCompany)
    : [];

  const ROLE_OPTIONS = [
    { key: 'admin', label: 'Admin' },
    { key: 'supervisor', label: 'Supervisor' },
    { key: 'employee', label: 'Employee' },
  ];

  // fetch roles for linked user when editing
  const [empUserId, setEmpUserId] = useState<string | null>(null);
  const { data: loadedUserRoles = [] } = useUserRoles(empUserId || undefined);

  useEffect(() => {
    if (loadedUserRoles && loadedUserRoles.length) setEmpRoles(loadedUserRoles);
  }, [loadedUserRoles]);

  const resetForm = () => {
    setEditingId(null);
    setEmpCompany('');
    setEmpBranch('');
    setEmpName('');
    setEmpGender('Male');
    setEmpBioId('');
    setEmpErpId('');
    setEmpIsInactive(false);
    setEmpInactDate('');
    setEmpRoles([]);
    setEmpUserId(null);
  };

  const generateEmployeeId = () => {
    const prefix = 'EMP';
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}-${timestamp}`;
  };

  const handleSave = async () => {
    if (!empName.trim()) {
      onToast('Employee name is required', 'error');
      return;
    }

    try {
      // Validation: API username numeric (if present)
      if (empApiUserId && !/^[0-9]+$/.test(empApiUserId)) {
        onToast('API User ID must be numeric', 'error');
        return;
      }

      if (editingId) {
        // Update existing employee
        // Only include api_username in the payload if the DB has that column (avoid runtime errors)
        const updatePayload: any = {
          id: editingId,
          full_name: empName,
          company_id: empCompany || null,
          branch_id: empBranch || null,
          biometric_id: empBioId || null,
          erp_username: empErpId || null,
          is_active: !empIsInactive,
          inactive_date: empIsInactive && empInactDate ? empInactDate : null,
        };
        if (hasApiUsername !== false) {
          updatePayload.api_username = empApiUserId || null;
        }

        await updateMutation.mutateAsync(updatePayload);
        // try to persist roles if user_id available
        try {
          const profile = profiles.find((p) => p.id === editingId);
          if (profile?.user_id) {
            await setUserRolesMutation.mutateAsync({ user_id: profile.user_id, roles: empRoles });
          } else if (empRoles.length) {
            onToast('Roles not saved - user not linked to auth user', 'error');
          }
        } catch (err: any) {
          console.warn('Failed to save roles', err);
        }
        onToast('Employee updated successfully', 'success');

        // Sync profile to Link Master (create or update mapping)
        try {
          const profile = profiles.find((p) => p.id === editingId);
          if (profile) {
            const res = await syncProfileToLinkMaster(profile);
            if (res?.synced) onToast('Link master synced', 'success');
            else onToast('Link master not synced', 'error');
          }
        } catch (err: any) {
          console.warn('Failed to sync link master on update', err);
          onToast('Failed to sync link master', 'error');
        }
      } else {
        // Create new employee
        const createPayload: any = {
          employee_id: generateEmployeeId(),
          full_name: empName,
          company_id: empCompany || null,
          branch_id: empBranch || null,
          biometric_id: empBioId || null,
          erp_username: empErpId || null,
          is_active: !empIsInactive,
          inactive_date: empIsInactive && empInactDate ? empInactDate : null,
        };
        if (hasApiUsername !== false) {
          createPayload.api_username = empApiUserId || null;
        }

        const created = await createMutation.mutateAsync(createPayload);
        // if the created profile has an associated auth user, save roles
        try {
          if (created?.user_id) {
            await setUserRolesMutation.mutateAsync({ user_id: created.user_id, roles: empRoles });
          } else if (empRoles.length) {
            onToast('Employee created but roles not saved - user not linked', 'error');
          }
        } catch (err: any) {
          console.warn('Failed to save roles after create', err);
        }
        onToast('Employee created successfully', 'success');

        // Sync newly created profile to Link Master
        try {
          if (created) {
            const res = await syncProfileToLinkMaster(created);
            if (res?.synced) onToast('Link master synced', 'success');
            else onToast('Link master not synced', 'error');
          }
        } catch (err: any) {
          console.warn('Failed to sync link master on create', err);
          onToast('Failed to sync link master', 'error');
        }
      }
      resetForm();
      setViewMode('LIST');
    } catch (error: any) {
      onToast(error.message || 'Failed to save employee', 'error');
    }
  };

  const handleEdit = (profile: any) => {
    setEditingId(profile.id);
    setEmpName(profile.full_name);
    setEmpCompany(profile.company_id || '');
    setEmpBranch(profile.branch_id || '');
    setEmpBioId(profile.biometric_id || '');
    setEmpErpId(profile.erp_username || '');
    setEmpApiUserId(profile.api_username || '');
    // if api_username column is missing, notify user when they open record
    if (hasApiUsername === false) {
      onToast('Database missing `api_username` column; API username will not be saved until migration is applied', 'error');
    }
    setEmpIsInactive(!profile.is_active);
    setEmpInactDate(profile.inactive_date || '');
    setEmpUserId(profile.user_id || null);
    setEmpRoles([]);
    setEmpLogin(profile.user_email || '');
    setViewMode('FORM');
  };

  const handlePasswordAction = async (password: string) => {
    if (!editingId) {
      onToast('Please select or save the employee first', 'error');
      throw new Error('no editing profile');
    }
    const profile = profiles.find((p) => p.id === editingId);
    try {
      if (passwordModal.mode === 'create') {
        if (!empLogin) {
          onToast('Enter Login ID (email) before creating', 'error');
          throw new Error('missing email');
        }
        const result = await createUserForProfile({ profile_id: editingId, email: empLogin, password });
        // if server returns a user id, update local state and refetch profiles
        if (result?.user?.id) {
          setEmpUserId(result.user.id);
        }
        queryClient.invalidateQueries({ queryKey: ['profiles'] });
        if (result?.user?.dev_mode) {
          if (result.user.linked) {
            onToast('Login created (dev mode) and linked', 'success');
          } else {
            onToast('Dev: login created but not linked to profile (no service key)', 'error');
          }
        } else {
          onToast('Login created and linked', 'success');
        }
      } else {
        const user_id = profile?.user_id;
        if (!user_id) {
          onToast('No linked auth user to reset password for', 'error');
          throw new Error('no linked user');
        }
        const res = await resetPasswordForUser({ user_id, password });
        if (res?.user?.dev_mode) {
          onToast('Password set (dev mode, no real change)', 'success');
        } else {
          onToast('Password reset successfully', 'success');
        }
      }
    } catch (err: any) {
      onToast(err.message || 'Operation failed', 'error');
      throw err;
    }
  };



  const columns = [
    {
      key: 'employee_id',
      header: 'ID Node',
      render: (p: any) => (
        <span className="font-mono text-xs text-primary font-bold">{p.employee_id}</span>
      ),
    },
    {
      key: 'full_name',
      header: 'Name',
      render: (p: any) => (
        <span className="text-sm font-black text-foreground/80 uppercase">{p.full_name}</span>
      ),
    },
    {
      key: 'companies',
      header: 'Entity Link',
      render: (p: any) => (
        <span className="text-[10px] font-bold text-muted-foreground uppercase">
          {p.companies?.company_name || '-'}
        </span>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (p: any) => (
        <div className="flex gap-2 flex-wrap">
          {p.roles && p.roles.length ? (
            p.roles.map((rk: string) => {
              const label = ROLE_OPTIONS.find((o) => o.key === rk)?.label || rk;
              return (
                <span
                  key={rk}
                  className="px-2 py-1 bg-secondary rounded text-[9px] font-bold text-muted-foreground uppercase tracking-widest"
                >
                  {label}
                </span>
              );
            })
          ) : (
            <span className="text-muted-foreground text-xs">No roles</span>
          )}
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      className: 'text-right',
      render: (p: any) => (
        <span className={`status-badge ${p.is_active ? 'status-active' : 'status-inactive'}`}>
          {p.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <GlassForm
      title="Employee Master (API)"
      icon={UserPlus}
      subtitle="Persistent Personnel Record"
      viewMode={viewMode}
      setViewMode={setViewMode}
      handleSave={handleSave}
      isEditing={!!editingId}
      onReset={resetForm}
      isSaving={updateMutation.isPending || createMutation.isPending}
    >
      {viewMode === 'LIST' ? (
        isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <DataTable columns={columns} data={profiles} keyField="id" onEdit={handleEdit} />
        )
      ) : (
        <div className="space-y-12 animate-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-16 gap-y-10">
            {/* Left Column - Main Data */}
            <div className="space-y-6">
              {hasApiUsername === false && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <strong className="font-bold">Database schema issue:</strong> `api_username` column missing in `profiles`. API Username will not be saved until migration is applied.
                </div>
              )}
              <div className="space-y-2">
                <label className="label-text">Company*</label>
                <select
                  className="glass-input"
                  value={empCompany}
                  onChange={(e) => {
                    setEmpCompany(e.target.value);
                    setEmpBranch('');
                  }}
                >
                  <option value="" className="bg-background">
                    Select Entity
                  </option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id} className="bg-background">
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="label-text">Branch</label>
                <select
                  className="glass-input disabled:opacity-20"
                  disabled={!empCompany}
                  value={empBranch}
                  onChange={(e) => setEmpBranch(e.target.value)}
                >
                  <option value="" className="bg-background">
                    Select Local Hub
                  </option>
                  {filteredBranches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-background">
                      {b.branch_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="label-text">Employee No.*</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={editingId ? profiles.find((p) => p.id === editingId)?.employee_id : 'AUTO_GEN_ID'}
                    className="glass-input flex-1 cursor-not-allowed opacity-50"
                  />
                  <button className="bg-secondary p-4 rounded-2xl border border-border text-primary hover:bg-muted">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="label-text">Employee Name*</label>
                <input
                  type="text"
                  placeholder="ENTER NAME"
                  className="glass-input"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="label-text">Gender*</label>
                <select
                  className="glass-input"
                  value={empGender}
                  onChange={(e) => setEmpGender(e.target.value)}
                >
                  <option value="Male" className="bg-background">Male</option>
                  <option value="Female" className="bg-background">Female</option>
                  <option value="Other" className="bg-background">Other</option>
                </select>
              </div>
            </div>

            {/* Center Column - IDs */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="label-text">Biometric ID</label>
                <input
                  type="text"
                  placeholder="Enter Biometric ID"
                  className="glass-input"
                  value={empBioId}
                  onChange={(e) => setEmpBioId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="label-text">ERP User ID</label>
                <input
                  type="text"
                  placeholder="Enter ERP User ID"
                  className="glass-input"
                  value={empErpId}
                  onChange={(e) => setEmpErpId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="label-text">API User ID (numeric)</label>
                <input
                  type="text"
                  placeholder="Enter API User ID"
                  className="glass-input"
                  value={empApiUserId}
                  onChange={(e) => setEmpApiUserId(e.target.value)}
                  disabled={hasApiUsername === false}
                />
                {hasApiUsername === false && (
                  <div className="text-xs text-muted-foreground">Disabled: `api_username` column missing in database</div>
                )}
              </div>

              {/* System Section */}
              <div className="bg-secondary/50 p-6 rounded-xl border border-border space-y-4">
                <label className="text-[11px] font-black text-success uppercase tracking-widest block">System</label>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Login ID (Email)</label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      className="glass-input"
                      value={empLogin}
                      onChange={(e) => setEmpLogin(e.target.value)}
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    {!profiles.find((p) => p.id === editingId)?.user_id ? (
                      <button
                        type="button"
                        className="btn bg-primary text-primary-foreground"
                        onClick={() => setPasswordModal({ open: true, mode: 'create' })}
                      >
                        Create Login
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn bg-secondary"
                        onClick={() => setPasswordModal({ open: true, mode: 'reset' })}
                      >
                        Reset Password
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn bg-muted-foreground/10"
                      onClick={() => navigator.clipboard?.writeText(profiles.find((p) => p.id === editingId)?.user_id || '')}
                    >
                      Copy User ID
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">Creating a login will create a Supabase auth user and link it to this profile. Passwords are never shown.</p>
              </div>

            </div>

            {/* Right Column - Status */}
            <div className="space-y-6">
              <div className="bg-secondary/50 p-8 rounded-[2.5rem] border border-border space-y-8">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={empIsInactive}
                    onChange={(e) => setEmpIsInactive(e.target.checked)}
                    className="w-5 h-5 rounded bg-background border-border checked:bg-primary cursor-pointer"
                  />
                  <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                    Inactive
                  </span>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Inactivated Dt
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      disabled={!empIsInactive}
                      className={`glass-input ${!empIsInactive ? 'opacity-20 cursor-not-allowed' : ''}`}
                      value={empInactDate}
                      onChange={(e) => setEmpInactDate(e.target.value)}
                    />
                    <Calendar
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Assign Roles moved to the bottom */}
          <div className="mt-8 bg-secondary/50 p-8 rounded-[2.5rem] border border-border">
            <label className="text-[11px] font-black text-primary uppercase tracking-widest block mb-6">
              Assign Roles
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((opt) => {
                const selected = empRoles.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() =>
                      setEmpRoles((prev) => (prev.includes(opt.key) ? prev.filter((i) => i !== opt.key) : [...prev, opt.key]))
                    }
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-black uppercase transition-all ${
                      selected
                        ? 'bg-primary/20 border-primary text-foreground'
                        : 'bg-secondary border-border text-muted-foreground hover:border-muted-foreground/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Assign one or more roles to determine employee access (roles define screens & permissions in Role Master).</p>
          </div>
        </div>
      )}
      <PasswordModal
        open={passwordModal.open}
        onOpenChange={(open) => setPasswordModal((s) => ({ ...s, open }))}
        onSubmit={handlePasswordAction}
        mode={passwordModal.mode}
        email={empLogin}
      />
    </GlassForm>
  );
};

export default EmployeeMaster;

import { useState } from 'react';
import { ShieldCheck, CheckSquare, Square } from 'lucide-react';
import GlassForm from '@/components/ui/GlassForm';
import DataTable from '@/components/ui/DataTable';
import { useCompanies } from '@/hooks/useCompanies';
import { APP_SCREENS } from '@/types';

interface RoleMasterProps {
  onToast: (message: string, type: 'success' | 'error') => void;
}

interface Role {
  id: string;
  role_name: string;
  assigned_screens: string[];
  assigned_company_ids: string[];
  is_active: boolean;
}

const RoleMaster = ({ onToast }: RoleMasterProps) => {
  const [viewMode, setViewMode] = useState<'FORM' | 'LIST'>('FORM');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleScreens, setRoleScreens] = useState<string[]>(['Overview']);
  const [roleCompanies, setRoleCompanies] = useState<string[]>([]);

  const { data: companies = [] } = useCompanies();

  // Local state for roles (since we don't have a roles table yet)
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'ROL_1',
      role_name: 'Admin',
      assigned_screens: APP_SCREENS,
      assigned_company_ids: [],
      is_active: true,
    },
    {
      id: 'ROL_2',
      role_name: 'Supervisor',
      assigned_screens: ['Overview', 'Employee Master', 'Punch Desk'],
      assigned_company_ids: [],
      is_active: true,
    },
  ]);

  const resetForm = () => {
    setEditingId(null);
    setRoleName('');
    setRoleScreens(['Overview']);
    setRoleCompanies([]);
  };

  const handleSave = () => {
    if (!roleName.trim()) {
      onToast('Role name is required', 'error');
      return;
    }
    if (roleCompanies.length === 0) {
      onToast('Link at least one company', 'error');
      return;
    }

    if (editingId) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, role_name: roleName, assigned_screens: roleScreens, assigned_company_ids: roleCompanies }
            : r
        )
      );
      onToast('Role updated successfully', 'success');
    } else {
      const newRole: Role = {
        id: `ROL_${Date.now()}`,
        role_name: roleName,
        assigned_screens: roleScreens,
        assigned_company_ids: roleCompanies,
        is_active: true,
      };
      setRoles([newRole, ...roles]);
      onToast('Role created successfully', 'success');
    }
    resetForm();
    setViewMode('LIST');
  };

  const handleEdit = (role: Role) => {
    setEditingId(role.id);
    setRoleName(role.role_name);
    setRoleScreens(role.assigned_screens);
    setRoleCompanies(role.assigned_company_ids);
    setViewMode('FORM');
  };

  const columns = [
    {
      key: 'role_name',
      header: 'Designation',
      render: (r: Role) => (
        <span className="text-sm font-black text-foreground uppercase">{r.role_name}</span>
      ),
    },
    {
      key: 'assigned_company_ids',
      header: 'Linked Companies',
      render: (r: Role) => (
        <div className="flex gap-2 flex-wrap">
          {r.assigned_company_ids.map((cid) => (
            <span
              key={cid}
              className="px-2 py-1 bg-secondary rounded text-[9px] font-bold text-muted-foreground uppercase tracking-widest"
            >
              {companies.find((c) => c.id === cid)?.company_code || cid}
            </span>
          ))}
          {r.assigned_company_ids.length === 0 && (
            <span className="text-muted-foreground text-xs">No companies linked</span>
          )}
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      className: 'text-right',
      render: (r: Role) => (
        <span className={`status-badge ${r.is_active ? 'status-active' : 'status-inactive'}`}>
          {r.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <GlassForm
      title="Role Governance"
      icon={ShieldCheck}
      subtitle="Access Level Management"
      viewMode={viewMode}
      setViewMode={setViewMode}
      handleSave={handleSave}
      isEditing={!!editingId}
      onReset={resetForm}
    >
      {viewMode === 'LIST' ? (
        <DataTable columns={columns} data={roles} keyField="id" onEdit={handleEdit} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-in">
          <div className="space-y-10">
            <div className="space-y-2">
              <label className="label-text">Role Name*</label>
              <input
                type="text"
                placeholder="E.G. REGIONAL HEAD"
                className="glass-input"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
            <div className="bg-secondary/50 p-8 rounded-[2.5rem] border border-border">
              <label className="text-[11px] font-black text-success uppercase tracking-widest block mb-6">
                Link Multiple Companies*
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {companies.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setRoleCompanies((prev) =>
                        prev.includes(c.id) ? prev.filter((i) => i !== c.id) : [...prev, c.id]
                      )
                    }
                    className={`flex items-center justify-between p-4 rounded-xl border text-[10px] font-black uppercase transition-all ${
                      roleCompanies.includes(c.id)
                        ? 'bg-success/20 border-success text-foreground'
                        : 'bg-secondary border-border text-muted-foreground'
                    }`}
                  >
                    {c.company_name}{' '}
                    {roleCompanies.includes(c.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                  </button>
                ))}
                {companies.length === 0 && (
                  <p className="text-muted-foreground text-sm col-span-2">
                    No companies found. Create companies first.
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-secondary/50 p-8 rounded-[2.5rem] border border-border">
            <label className="text-[11px] font-black text-primary uppercase tracking-widest block mb-6">
              Module Permissions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {APP_SCREENS.map((scr) => (
                <button
                  key={scr}
                  type="button"
                  onClick={() =>
                    setRoleScreens((prev) =>
                      prev.includes(scr) ? prev.filter((s) => s !== scr) : [...prev, scr]
                    )
                  }
                  className={`flex items-center justify-between p-4 rounded-xl border text-[10px] font-black uppercase transition-all ${
                    roleScreens.includes(scr)
                      ? 'bg-primary/20 border-primary text-foreground'
                      : 'bg-secondary border-border text-muted-foreground hover:border-muted-foreground/50'
                  }`}
                >
                  {scr} {roleScreens.includes(scr) ? <CheckSquare size={14} /> : <Square size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </GlassForm>
  );
};

export default RoleMaster;

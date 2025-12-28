import { useState } from 'react';
import { UserPlus, Calendar, MoreHorizontal } from 'lucide-react';
import GlassForm from '@/components/ui/GlassForm';
import DataTable from '@/components/ui/DataTable';
import { useProfiles, useUpdateProfile } from '@/hooks/useProfiles';
import { useCompanies } from '@/hooks/useCompanies';
import { useBranches } from '@/hooks/useBranches';

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
  const [empIsInactive, setEmpIsInactive] = useState(false);
  const [empInactDate, setEmpInactDate] = useState('');

  const { data: profiles = [], isLoading } = useProfiles();
  const { data: companies = [] } = useCompanies();
  const { data: allBranches = [] } = useBranches();
  const updateMutation = useUpdateProfile();

  const filteredBranches = empCompany
    ? allBranches.filter((b) => b.company_id === empCompany)
    : [];

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
  };

  const handleSave = async () => {
    if (!editingId) {
      onToast('Employee creation requires user signup. Use employee self-registration.', 'error');
      return;
    }

    if (!empName.trim()) {
      onToast('Employee name is required', 'error');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingId,
        full_name: empName,
        company_id: empCompany || null,
        branch_id: empBranch || null,
        biometric_id: empBioId || null,
        is_active: !empIsInactive,
        inactive_date: empIsInactive && empInactDate ? empInactDate : null,
      });
      onToast('Employee updated successfully', 'success');
      resetForm();
      setViewMode('LIST');
    } catch (error: any) {
      onToast(error.message || 'Failed to update employee', 'error');
    }
  };

  const handleEdit = (profile: any) => {
    setEditingId(profile.id);
    setEmpName(profile.full_name);
    setEmpCompany(profile.company_id || '');
    setEmpBranch(profile.branch_id || '');
    setEmpBioId(profile.biometric_id || '');
    setEmpIsInactive(!profile.is_active);
    setEmpInactDate(profile.inactive_date || '');
    setViewMode('FORM');
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
      isSaving={updateMutation.isPending}
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
        </div>
      )}
    </GlassForm>
  );
};

export default EmployeeMaster;

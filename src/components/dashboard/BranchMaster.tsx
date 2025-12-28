import { useState } from 'react';
import { GitBranch } from 'lucide-react';
import GlassForm from '@/components/ui/GlassForm';
import DataTable from '@/components/ui/DataTable';
import { useBranches, useCreateBranch, useUpdateBranch, Branch } from '@/hooks/useBranches';
import { useCompanies } from '@/hooks/useCompanies';

interface BranchMasterProps {
  onToast: (message: string, type: 'success' | 'error') => void;
}

const BranchMaster = ({ onToast }: BranchMasterProps) => {
  const [viewMode, setViewMode] = useState<'FORM' | 'LIST'>('FORM');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [companyId, setCompanyId] = useState('');

  const { data: branches = [], isLoading } = useBranches();
  const { data: companies = [] } = useCompanies();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  const resetForm = () => {
    setEditingId(null);
    setBranchName('');
    setBranchCode('');
    setCompanyId('');
  };

  const handleSave = async () => {
    if (!branchName.trim()) {
      onToast('Branch name is required', 'error');
      return;
    }
    if (!branchCode.trim()) {
      onToast('Branch code is required', 'error');
      return;
    }
    if (!companyId) {
      onToast('Parent company is required', 'error');
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          branch_name: branchName,
          branch_code: branchCode.toUpperCase(),
          company_id: companyId,
        });
        onToast('Branch updated successfully', 'success');
      } else {
        await createMutation.mutateAsync({
          branch_name: branchName,
          branch_code: branchCode.toUpperCase(),
          company_id: companyId,
        });
        onToast('Branch created successfully', 'success');
      }
      resetForm();
      setViewMode('LIST');
    } catch (error: any) {
      onToast(error.message || 'Failed to save branch', 'error');
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingId(branch.id);
    setBranchName(branch.branch_name);
    setBranchCode(branch.branch_code);
    setCompanyId(branch.company_id);
    setViewMode('FORM');
  };

  const columns = [
    {
      key: 'branch_name',
      header: 'Branch Name',
      render: (b: Branch) => (
        <span className="text-sm font-black text-foreground uppercase">{b.branch_name}</span>
      ),
    },
    {
      key: 'branch_code',
      header: 'Code',
      render: (b: Branch) => (
        <span className="font-mono text-xs text-primary font-bold">{b.branch_code}</span>
      ),
    },
    {
      key: 'company_id',
      header: 'Parent Company',
      render: (b: Branch) => (
        <span className="text-xs text-muted-foreground font-bold uppercase">
          {companies.find((c) => c.id === b.company_id)?.company_name || '-'}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      className: 'text-right',
      render: (b: Branch) => (
        <span className={`status-badge ${b.is_active ? 'status-active' : 'status-inactive'}`}>
          {b.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <GlassForm
      title="Branch Master"
      icon={GitBranch}
      subtitle="Local Hub Management"
      viewMode={viewMode}
      setViewMode={setViewMode}
      handleSave={handleSave}
      isEditing={!!editingId}
      onReset={resetForm}
      isSaving={createMutation.isPending || updateMutation.isPending}
    >
      {viewMode === 'LIST' ? (
        isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <DataTable columns={columns} data={branches} keyField="id" onEdit={handleEdit} />
        )
      ) : (
        <div className="max-w-xl mx-auto space-y-10 animate-in">
          <div className="space-y-2">
            <label className="label-text">Parent Company*</label>
            <select
              className="glass-input"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            >
              <option value="" className="bg-background">
                Select Corporate Owner
              </option>
              {companies.map((c) => (
                <option key={c.id} value={c.id} className="bg-background">
                  {c.company_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="label-text">Branch Name*</label>
            <input
              type="text"
              placeholder="ENTER BRANCH NAME"
              className="glass-input"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="label-text">Branch Code*</label>
            <input
              type="text"
              placeholder="E.G. HQ-01"
              className="glass-input"
              maxLength={10}
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
            />
          </div>
        </div>
      )}
    </GlassForm>
  );
};

export default BranchMaster;

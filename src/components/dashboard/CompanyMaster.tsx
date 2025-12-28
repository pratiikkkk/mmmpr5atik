import { useState } from 'react';
import { Building2 } from 'lucide-react';
import GlassForm from '@/components/ui/GlassForm';
import DataTable from '@/components/ui/DataTable';
import { useCompanies, useCreateCompany, useUpdateCompany, Company } from '@/hooks/useCompanies';

interface CompanyMasterProps {
  onToast: (message: string, type: 'success' | 'error') => void;
}

const CompanyMaster = ({ onToast }: CompanyMasterProps) => {
  const [viewMode, setViewMode] = useState<'FORM' | 'LIST'>('FORM');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyCode, setCompanyCode] = useState('');

  const { data: companies = [], isLoading } = useCompanies();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  const resetForm = () => {
    setEditingId(null);
    setCompanyName('');
    setCompanyCode('');
  };

  const handleSave = async () => {
    if (!companyName.trim()) {
      onToast('Company name is required', 'error');
      return;
    }
    if (!companyCode.trim()) {
      onToast('Company code is required', 'error');
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          company_name: companyName,
          company_code: companyCode.toUpperCase(),
        });
        onToast('Company updated successfully', 'success');
      } else {
        await createMutation.mutateAsync({
          company_name: companyName,
          company_code: companyCode.toUpperCase(),
        });
        onToast('Company created successfully', 'success');
      }
      resetForm();
      setViewMode('LIST');
    } catch (error: any) {
      onToast(error.message || 'Failed to save company', 'error');
    }
  };

  const handleEdit = (company: Company) => {
    setEditingId(company.id);
    setCompanyName(company.company_name);
    setCompanyCode(company.company_code);
    setViewMode('FORM');
  };

  const columns = [
    {
      key: 'company_name',
      header: 'Nomenclature',
      render: (c: Company) => (
        <span className="text-sm font-black text-foreground uppercase">{c.company_name}</span>
      ),
    },
    {
      key: 'company_code',
      header: 'Code',
      render: (c: Company) => (
        <span className="font-mono text-xs text-primary font-bold">{c.company_code}</span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      className: 'text-right',
      render: (c: Company) => (
        <span className={`status-badge ${c.is_active ? 'status-active' : 'status-inactive'}`}>
          {c.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <GlassForm
      title="Company Master"
      icon={Building2}
      subtitle="Corporate Entity Management"
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
          <DataTable columns={columns} data={companies} keyField="id" onEdit={handleEdit} />
        )
      ) : (
        <div className="max-w-xl mx-auto space-y-10 animate-in">
          <div className="space-y-2">
            <label className="label-text">Company Name*</label>
            <input
              type="text"
              placeholder="ENTER COMPANY NAME"
              className="glass-input"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="label-text">Company Code*</label>
            <input
              type="text"
              placeholder="E.G. KBS"
              className="glass-input"
              maxLength={10}
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
            />
          </div>
        </div>
      )}
    </GlassForm>
  );
};

export default CompanyMaster;

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Overview from '@/components/dashboard/Overview';
import CompanyMaster from '@/components/dashboard/CompanyMaster';
import BranchMaster from '@/components/dashboard/BranchMaster';
import PunchDesk from '@/components/dashboard/PunchDesk';
import Reports from '@/components/dashboard/Reports';
import CustomToast from '@/components/ui/CustomToast';
import { TabType } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.OVERVIEW);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { user } = useAuth();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case TabType.OVERVIEW:
        return <Overview onNavigate={setActiveTab} />;
      case TabType.COMPANY_MASTER:
        return <CompanyMaster onToast={showToast} />;
      case TabType.BRANCH_MASTER:
        return <BranchMaster onToast={showToast} />;
      case TabType.MANUAL_ENTRY:
        return <PunchDesk onToast={showToast} />;
      case TabType.REPORTS:
        return <Reports />;
      default:
        return <Overview onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden pb-20">
      {toast && <CustomToast message={toast.message} type={toast.type} />}
      <Header userName={user?.email?.split('@')[0] || 'System'} />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;

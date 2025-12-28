import { Layout, Building2, GitBranch, ShieldCheck, UserPlus, LogIn, FileText } from 'lucide-react';
import { TabType, NavTab } from '@/types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const navTabs: NavTab[] = [
  { id: TabType.OVERVIEW, name: 'Dashboard', icon: Layout },
  { id: TabType.COMPANY_MASTER, name: 'Company', icon: Building2 },
  { id: TabType.BRANCH_MASTER, name: 'Branch', icon: GitBranch },
  { id: TabType.ROLE_MASTER, name: 'Role', icon: ShieldCheck },
  { id: TabType.EMP_MASTER, name: 'Employee', icon: UserPlus },
  { id: TabType.MANUAL_ENTRY, name: 'Punch Desk', icon: LogIn },
  { id: TabType.REPORTS, name: 'Reports', icon: FileText },
];

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  return (
    <nav className="flex justify-center mb-12 overflow-x-auto no-scrollbar scroll-smooth">
      <div className="bg-secondary/50 backdrop-blur-2xl p-1.5 rounded-3xl border border-border inline-flex shadow-xl">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id
                ? 'bg-muted text-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground/50'
            }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'text-primary' : ''} />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;

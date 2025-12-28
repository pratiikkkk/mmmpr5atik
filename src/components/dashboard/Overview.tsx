import { Building2, UserPlus, ShieldCheck, Plus } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { useProfiles } from '@/hooks/useProfiles';
import { TabType } from '@/types';

interface OverviewProps {
  onNavigate: (tab: TabType) => void;
}

const Overview = ({ onNavigate }: OverviewProps) => {
  const { data: companies = [] } = useCompanies();
  const { data: profiles = [] } = useProfiles();

  const stats = [
    {
      title: 'Corporate Hub',
      description: `${companies.length} Entities currently indexed in the database.`,
      icon: Building2,
      color: 'primary',
      action: () => onNavigate(TabType.COMPANY_MASTER),
      actionLabel: 'Access Registry',
    },
    {
      title: 'Personnel Node',
      description: `${profiles.length} Active personnel links synced with system.`,
      icon: UserPlus,
      color: 'success',
      action: () => onNavigate(TabType.EMP_MASTER),
      actionLabel: 'Manage Personnel',
    },
    {
      title: 'Governance',
      description: 'RBAC privilege profiles active across nodes.',
      icon: ShieldCheck,
      color: 'purple',
      action: () => onNavigate(TabType.ROLE_MASTER),
      actionLabel: 'Security Policy',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; hover: string }> = {
      primary: {
        bg: 'bg-primary/10',
        border: 'border-primary/10',
        text: 'text-primary',
        hover: 'hover:border-primary/30',
      },
      success: {
        bg: 'bg-success/10',
        border: 'border-success/10',
        text: 'text-success',
        hover: 'hover:border-success/30',
      },
      purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/10',
        text: 'text-purple-400',
        hover: 'hover:border-purple-500/30',
      },
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in">
      {stats.map((stat) => {
        const colors = getColorClasses(stat.color);
        return (
          <div
            key={stat.title}
            className={`backdrop-blur-3xl bg-card/50 border border-border p-10 rounded-[3rem] shadow-xl space-y-6 group ${colors.hover} transition-all`}
          >
            <div
              className={`w-12 h-12 ${colors.bg} rounded-2xl flex items-center justify-center ${colors.text} ${colors.border} group-hover:scale-110 transition-transform`}
            >
              <stat.icon size={24} />
            </div>
            <h3 className="text-lg font-black uppercase">{stat.title}</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold leading-relaxed">
              {stat.description}
            </p>
            <button
              onClick={stat.action}
              className={`text-[10px] font-black ${colors.text} uppercase tracking-[0.3em] flex items-center gap-2 group/btn`}
            >
              {stat.actionLabel}{' '}
              <Plus size={12} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Overview;

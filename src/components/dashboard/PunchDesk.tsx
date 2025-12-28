import { useState, useEffect } from 'react';
import { LogIn, Navigation, Globe, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfiles';
import { useCreatePunch, useAttendancePunches } from '@/hooks/useAttendance';

interface PunchDeskProps {
  onToast: (message: string, type: 'success' | 'error') => void;
}

const PunchDesk = ({ onToast }: PunchDeskProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id || '');
  const createPunchMutation = useCreatePunch();
  
  const today = new Date().toISOString().split('T')[0];
  const { data: todayPunches = [] } = useAttendancePunches(profile?.id, today);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunch = async (type: 'IN' | 'OUT') => {
    if (!profile?.id) {
      onToast('Profile not found. Please contact admin.', 'error');
      return;
    }

    try {
      await createPunchMutation.mutateAsync({
        profile_id: profile.id,
        punch_type: type,
        source: 'WEB',
      });
      onToast(`Punch ${type} captured successfully`, 'success');
    } catch (error: any) {
      onToast(error.message || 'Failed to record punch', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in">
      <div className="lg:col-span-5">
        <div className="backdrop-blur-3xl bg-card/50 border border-border p-16 rounded-[4rem] shadow-2xl text-center space-y-12">
          <div className="space-y-4">
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.5em]">
              Network Station Hub
            </p>
            <div className="text-8xl font-black text-foreground tabular-nums tracking-tighter">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <button
              onClick={() => handlePunch('IN')}
              disabled={createPunchMutation.isPending}
              className="bg-success py-10 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest shadow-2xl hover:bg-success/90 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
              style={{ boxShadow: '0 8px 40px hsl(152 69% 43% / 0.3)' }}
            >
              <LogIn size={32} />
              PUNCH IN
            </button>
            <button
              onClick={() => handlePunch('OUT')}
              disabled={createPunchMutation.isPending}
              className="bg-secondary border border-border py-10 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
            >
              <LogIn size={32} className="rotate-180" />
              PUNCH OUT
            </button>
          </div>
          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="flex items-center gap-3">
              <Navigation size={14} className="text-primary" />
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Main Hub
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Globe size={14} className="text-success" />
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Active Node
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-7">
        <div className="backdrop-blur-2xl bg-card/50 border border-border rounded-[4rem] shadow-2xl h-full overflow-hidden">
          <div className="p-10 border-b border-border bg-secondary/30 flex justify-between items-center">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Today's Punches</h3>
            <div className="text-[10px] font-black text-primary flex items-center gap-2">
              <Activity size={14} className="animate-pulse" /> LIVE
            </div>
          </div>
          <div className="p-10 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
            {todayPunches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No punches recorded today</p>
              </div>
            ) : (
              todayPunches.map((punch, i) => (
                <div
                  key={punch.id}
                  className="flex justify-between items-center p-6 bg-secondary/50 rounded-3xl border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${
                        punch.punch_type === 'IN'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {punch.punch_type}
                    </div>
                    <div>
                      <span className="text-sm font-black uppercase text-foreground/80 tracking-tight block">
                        Punch {punch.punch_type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(punch.punch_time).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-success font-bold uppercase">
                    {punch.source}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PunchDesk;

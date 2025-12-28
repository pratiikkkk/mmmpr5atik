import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeaderProps {
  userName?: string;
}

const Header = ({ userName = 'System' }: HeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-6 z-50 mx-auto max-w-7xl px-4">
      <div className="backdrop-blur-3xl bg-card/80 border border-border rounded-3xl px-8 h-20 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <Activity className="text-success w-6 h-6" />
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">KBS Enterprise</h1>
            <p className="text-[8px] text-success/60 uppercase tracking-[0.4em] font-black">
              Attendance Portal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <span className="text-[8px] text-muted-foreground uppercase font-black block tracking-widest">
              Network Time
            </span>
            <span className="text-sm font-mono text-foreground/80">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
          <div className="h-8 w-px bg-border hidden md:block"></div>
          <div className="hidden md:flex items-center gap-3 bg-secondary px-5 py-2 rounded-xl border border-border">
            <div className="w-2 h-2 rounded-full bg-success shadow-lg animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Sys: {userName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

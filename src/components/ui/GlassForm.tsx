import { List, Plus, Save, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface GlassFormProps {
  title: string;
  icon: LucideIcon;
  subtitle: string;
  children: ReactNode;
  viewMode: 'FORM' | 'LIST';
  setViewMode: (mode: 'FORM' | 'LIST') => void;
  handleSave: () => void;
  isEditing: boolean;
  onReset: () => void;
  isSaving?: boolean;
}

const GlassForm = ({
  title,
  icon: Icon,
  subtitle,
  children,
  viewMode,
  setViewMode,
  handleSave,
  isEditing,
  onReset,
  isSaving = false,
}: GlassFormProps) => (
  <div className="animate-in">
    <div className="backdrop-blur-3xl bg-card/50 border border-border rounded-[2.5rem] shadow-2xl overflow-hidden relative">
      <div className="px-8 py-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-2 rounded-xl border border-primary/20">
            <Icon size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">{title}</h2>
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setViewMode('LIST');
              onReset();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
              viewMode === 'LIST'
                ? 'bg-primary border-primary shadow-lg text-primary-foreground'
                : 'bg-secondary border-border hover:bg-muted'
            }`}
          >
            <List size={14} /> List View
          </button>
          <button
            onClick={() => {
              setViewMode('FORM');
              onReset();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
              viewMode === 'FORM' && !isEditing
                ? 'bg-primary border-primary shadow-lg text-primary-foreground'
                : 'bg-secondary border-border hover:bg-muted'
            }`}
          >
            <Plus size={14} /> New Record
          </button>
          <div className="h-8 w-px bg-border mx-2"></div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-success hover:bg-success/90 shadow-lg active:scale-95 border border-success/30 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 4px 20px hsl(152 69% 43% / 0.2)' }}
          >
            <Save size={14} /> {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
      <div className="p-8 lg:p-12">{children}</div>
    </div>
  </div>
);

export default GlassForm;

import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

const Toast = ({ message, type }: ToastProps) => {
  return (
    <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[100] slide-in-from-top">
      <div
        className={`backdrop-blur-xl border px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 ${
          type === 'error'
            ? 'bg-destructive/20 border-destructive/30'
            : 'bg-success/20 border-success/30'
        }`}
      >
        {type === 'error' ? (
          <AlertCircle className="text-destructive" size={18} />
        ) : (
          <CheckCircle2 className="text-success" size={18} />
        )}
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{message}</span>
      </div>
    </div>
  );
};

export default Toast;

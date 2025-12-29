import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface PasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => Promise<void>;
  mode: 'create' | 'reset';
  email?: string;
}

const PasswordModal = ({ open, onOpenChange, onSubmit, mode, email }: PasswordModalProps) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const title = mode === 'create' ? 'Create Login' : 'Reset Password';

  const handleSubmit = async () => {
    if (!password || !confirm) return toast({ title: 'Please enter password and confirm', description: undefined });
    if (password !== confirm) return toast({ title: "Passwords don't match" });
    setLoading(true);
    try {
      await onSubmit(password);
      toast({ title: `${mode === 'create' ? 'Created' : 'Reset'} successfully` });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: err?.message || 'Operation failed' });
    } finally {
      setLoading(false);
      setPassword('');
      setConfirm('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{email ? `For: ${email}` : 'Set a password for this employee login.'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <label className="label-text">Password</label>
          <input
            type="password"
            className="glass-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <label className="label-text">Confirm Password</label>
          <input
            type="password"
            className="glass-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
          />
        </div>
        <DialogFooter>
          <div className="flex gap-2">
            <button
              className="btn"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button className="btn bg-primary text-primary-foreground" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Working...' : mode === 'create' ? 'Create' : 'Reset'}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordModal;

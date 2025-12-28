import { FileText } from 'lucide-react';

const Reports = () => {
  return (
    <div className="backdrop-blur-3xl bg-card/50 border border-border p-16 rounded-[4rem] shadow-2xl text-center space-y-8 animate-in">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
        <FileText size={32} />
      </div>
      <h2 className="text-2xl font-black uppercase">Reports Console</h2>
      <p className="text-muted-foreground text-sm max-w-md mx-auto">
        Attendance reports and analytics will be available here. Generate daily, weekly, and monthly attendance summaries.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        {['Daily Report', 'Weekly Summary', 'Monthly Analysis'].map((report) => (
          <button
            key={report}
            className="p-6 bg-secondary rounded-2xl border border-border hover:bg-muted transition-all text-sm font-bold uppercase tracking-wide"
          >
            {report}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Reports;

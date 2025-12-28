const Footer = () => {
  return (
    <footer className="max-w-7xl mx-auto px-4 py-20 border-t border-border mt-32 flex flex-col md:flex-row justify-between items-center gap-12">
      <div className="text-center md:text-left">
        <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.6em] mb-2">
          KBS Enterprise Architecture v4.98
        </h5>
        <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
          © 2024 KBS Global Solutions • Cloud Node Active
        </p>
      </div>
      <div className="flex gap-12">
        <div className="text-center">
          <span className="text-[8px] font-black text-muted-foreground/30 uppercase block mb-1 tracking-widest">
            Database
          </span>
          <span className="text-xs font-black text-success/60 uppercase">SQL-LINKED</span>
        </div>
        <div className="text-center">
          <span className="text-[8px] font-black text-muted-foreground/30 uppercase block mb-1 tracking-widest">
            Privileges
          </span>
          <span className="text-xs font-black text-primary/60 uppercase">RBAC-STRICT</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

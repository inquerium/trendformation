const variants = {
  pr: 'bg-phosphor/10 text-phosphor-dim border border-phosphor/20',
  warning: 'bg-amber/10 text-amber border border-amber/20',
  danger: 'bg-danger/10 text-danger border border-danger/20',
  info: 'bg-info/10 text-info border border-info/20',
  success: 'bg-success/10 text-success border border-success/20',
  default: 'bg-surface3 text-text2 border border-border',
};

export function Badge({ variant = 'default', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-display tracking-wide uppercase rounded-full px-2.5 py-0.5 ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

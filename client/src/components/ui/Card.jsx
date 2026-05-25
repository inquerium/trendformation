const variants = {
  default: 'bg-surface rounded-xl border border-border p-5',
  elevated: 'bg-surface2 rounded-xl border border-border p-5',
  accent: 'bg-surface rounded-xl border border-indigo/30 p-5',
};

export function Card({ variant = 'default', className = '', children, ...props }) {
  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

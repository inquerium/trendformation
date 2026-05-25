import { Spinner } from './Spinner.jsx';

const variants = {
  primary:
    'bg-indigo text-void font-display font-bold tracking-widest uppercase text-xs rounded-lg px-5 py-2.5 hover:bg-indigo-light transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-surface2 text-text1 rounded-lg px-5 py-2.5 border border-border hover:border-border2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'text-indigo-light rounded-lg px-5 py-2.5 hover:bg-indigo/10 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'bg-danger/10 text-danger border border-danger/20 rounded-lg px-5 py-2.5 hover:bg-danger/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
  phosphor:
    'bg-phosphor text-void font-display font-bold tracking-widest uppercase text-sm rounded-xl px-8 py-4 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
};

export function Button({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  ...props
}) {
  return (
    <button
      className={`${variants[variant]} inline-flex items-center justify-center gap-2 ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

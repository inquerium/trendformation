export function Input({ label, error, className = '', type, ...props }) {
  const inputMode = props.inputMode ?? (type === 'number' ? 'decimal' : undefined);
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-sans text-xs text-text2 font-medium tracking-wide">
          {label}
        </label>
      )}
      <input
        type={type}
        inputMode={inputMode}
        className={`bg-abyss border ${error ? 'border-danger focus:border-danger' : 'border-border focus:border-indigo'} rounded-lg px-4 py-2.5 text-text1 placeholder:text-text3 focus:outline-none transition-colors text-sm ${className}`}
        {...props}
      />
      {error && <span className="text-danger text-xs">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-sans text-xs text-text2 font-medium tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`bg-abyss border ${error ? 'border-danger focus:border-danger' : 'border-border focus:border-indigo'} rounded-lg px-4 py-2.5 text-text1 placeholder:text-text3 focus:outline-none transition-colors text-sm resize-none ${className}`}
        rows={3}
        {...props}
      />
      {error && <span className="text-danger text-xs">{error}</span>}
    </div>
  );
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-sans text-xs text-text2 font-medium tracking-wide">
          {label}
        </label>
      )}
      <select
        className={`bg-abyss border ${error ? 'border-danger' : 'border-border focus:border-indigo'} rounded-lg px-4 py-2.5 text-text1 focus:outline-none transition-colors text-sm ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-danger text-xs">{error}</span>}
    </div>
  );
}

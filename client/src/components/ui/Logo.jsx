export function Logo({ size = 40, showWordmark = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg viewBox="0 0 52 52" width={size} height={size} style={{ flexShrink: 0 }}>
        <rect width="52" height="52" rx="11" fill="#1E1B4B" />
        <circle cx="13" cy="13" r="1" fill="#4338CA" opacity="0.55" />
        <circle cx="26" cy="13" r="1" fill="#4338CA" opacity="0.55" />
        <circle cx="39" cy="13" r="1" fill="#4338CA" opacity="0.55" />
        <circle cx="13" cy="26" r="1" fill="#4338CA" opacity="0.55" />
        <circle cx="26" cy="26" r="1" fill="#4338CA" opacity="0.55" />
        <circle cx="39" cy="26" r="1" fill="#4338CA" opacity="0.55" />
        <circle cx="13" cy="39" r="1" fill="#4338CA" opacity="0.55" />
        <circle cx="26" cy="39" r="1" fill="#4338CA" opacity="0.55" />
        <line x1="10" y1="40" x2="20" y2="30" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="20" y1="30" x2="31" y2="22" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="31" y1="22" x2="42" y2="10" stroke="#A5B4FC" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="10" cy="40" r="2.5" fill="#6366F1" />
        <circle cx="20" cy="30" r="2.5" fill="#818CF8" />
        <circle cx="31" cy="22" r="2.5" fill="#A5B4FC" />
        <circle cx="42" cy="10" r="4.5" fill="#AAFF4D" />
        <circle cx="42" cy="10" r="2" fill="#0F1117" />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontSize: 17,
            fontWeight: 800,
            fontFamily: "'Syne', sans-serif",
            letterSpacing: '0.1em',
            background: 'linear-gradient(135deg, #818CF8 0%, #AAFF4D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
          }}
        >
          T4M
        </span>
      )}
    </div>
  );
}

export function StatCard({ label, value, delta, deltaPositive, unit, muted = false }) {
  return (
    <div className="bg-surface2 rounded-xl p-4">
      <p className="text-text3 text-xs font-display tracking-widest uppercase mb-1">{label}</p>
      <p className={`text-2xl font-display font-bold ${muted ? 'text-text2' : 'text-text1'}`}>
        {value ?? '—'}
        {unit && <span className="text-sm text-text3 ml-1 font-sans font-normal">{unit}</span>}
      </p>
      {delta != null && (
        <p className={`text-xs mt-0.5 ${deltaPositive ? 'text-phosphor-dim' : 'text-danger'}`}>
          {deltaPositive ? '+' : ''}
          {delta}
        </p>
      )}
    </div>
  );
}

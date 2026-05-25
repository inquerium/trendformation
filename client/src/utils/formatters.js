import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateStr, fmt = 'MMM d') {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return isValid(d) ? format(d, fmt) : '—';
}

export function formatWeight(value, unit = 'lbs') {
  if (value == null) return '—';
  return `${Number(value).toFixed(1)} ${unit}`;
}

export function formatCalories(value) {
  if (value == null) return '—';
  return `${Math.round(value)} kcal`;
}

export function epley1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return null;
  return Math.round(weight * (1 + reps / 30));
}

export function pearsonCorrelation(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;
  const meanX = xs.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = ys.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

export function describeCorrelation(r) {
  if (r == null) return '';
  const abs = Math.abs(r);
  const dir = r >= 0 ? 'positive' : 'negative';
  if (abs >= 0.7) return `Strong ${dir} correlation`;
  if (abs >= 0.4) return `Moderate ${dir} correlation`;
  if (abs >= 0.2) return `Weak ${dir} correlation`;
  return 'No meaningful correlation';
}

export function correlationColor(r) {
  if (r == null) return 'text-text2';
  const abs = Math.abs(r);
  if (abs >= 0.6) return 'text-success';
  if (abs >= 0.3) return 'text-warning';
  return 'text-danger';
}

import { useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { GitCompareArrows } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { getDashboardCorrelations } from '../api/dashboard.api.js';
import { formatDate, pearsonCorrelation, describeCorrelation, correlationColor } from '../utils/formatters.js';
import { DATE_RANGES } from '../utils/constants.js';

const METRICS = [
  { key: 'weight', label: 'Weight' },
  { key: 'hours_slept', label: 'Hours Slept' },
  { key: 'sleep_score', label: 'Sleep Score' },
  { key: 'caffeine_mg', label: 'Caffeine (mg)' },
  { key: 'calories_in', label: 'Calories Consumed' },
  { key: 'protein_g', label: 'Protein (g)' },
  { key: 'active_calories', label: 'Active Calories Burned' },
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#1E2335',
    border: '1px solid #3A4160',
    borderRadius: 8,
    fontSize: 12,
    color: '#F4F6FF',
  },
  itemStyle: { color: '#F4F6FF' },
  labelStyle: { color: '#8B96B8' },
};

// Align two sparse series by date → merged chart data
function merge(a, b) {
  const dates = [...new Set([...a.map((d) => d.date), ...b.map((d) => d.date)])].sort();
  const aMap = Object.fromEntries(a.map((d) => [d.date, d.value]));
  const bMap = Object.fromEntries(b.map((d) => [d.date, d.value]));
  return dates.map((date) => ({ date, a: aMap[date] ?? null, b: bMap[date] ?? null }));
}

function labelOf(key) {
  return METRICS.find((m) => m.key === key)?.label ?? key;
}

export default function Compare() {
  const [metricA, setMetricA] = useState('weight');
  const [metricB, setMetricB] = useState('hours_slept');
  const [range, setRange] = useState(30);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  async function run() {
    if (metricA === metricB) return;
    setLoading(true);
    setRan(true);
    try {
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await getDashboardCorrelations({ metricA, metricB, from, to });
      const { a, b } = res.data.data;
      setChartData({ merged: merge(a, b), rawA: a, rawB: b });
    } catch {
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }

  const xs = chartData?.rawA.map((d) => d.value) ?? [];
  const ys = chartData?.rawB.map((d) => d.value) ?? [];
  const r = pearsonCorrelation(xs, ys);
  const description = describeCorrelation(r);
  const rColor = correlationColor(r);

  const selectCls =
    'bg-abyss border border-border rounded-lg px-4 py-2.5 text-text1 focus:outline-none focus:border-indigo text-sm transition-colors';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text1 mb-1">Compare / VS Mode</h1>
        <p className="text-text3 text-sm">Explore correlations between any two metrics.</p>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <select value={metricA} onChange={(e) => setMetricA(e.target.value)} className={selectCls}>
              {METRICS.filter((m) => m.key !== metricB).map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
            <span className="text-text3 font-display font-bold shrink-0">vs</span>
            <select value={metricB} onChange={(e) => setMetricB(e.target.value)} className={selectCls}>
              {METRICS.filter((m) => m.key !== metricA).map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {DATE_RANGES.map(({ label, days }) => (
              <button
                key={days}
                onClick={() => setRange(days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all ${
                  range === days
                    ? 'bg-indigo text-void'
                    : 'bg-surface text-text2 hover:bg-surface2 border border-border'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <Button onClick={run} disabled={metricA === metricB}>
            <GitCompareArrows size={15} /> Compare
          </Button>
        </div>
      </Card>

      {/* Results */}
      {loading && (
        <div className="flex justify-center py-16"><Spinner /></div>
      )}

      {!loading && ran && !chartData && (
        <Card className="flex flex-col items-center py-12 gap-2">
          <p className="text-text2 text-sm">No overlapping data found for these metrics.</p>
          <p className="text-text3 text-xs">Try logging more entries or selecting a wider time range.</p>
        </Card>
      )}

      {!loading && chartData && (
        <>
          {/* Chart */}
          <Card>
            <p className="text-xs text-text3 uppercase tracking-widest font-display mb-4">
              {labelOf(metricA)} vs {labelOf(metricB)} — {range}d
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData.merged} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => formatDate(d, 'M/d')}
                  tick={{ fill: '#8B96B8', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="a"
                  tick={{ fill: '#8B96B8', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />
                <YAxis
                  yAxisId="b"
                  orientation="right"
                  tick={{ fill: '#8B96B8', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  labelFormatter={(d) => formatDate(d, 'MMM d, yyyy')}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#8B96B8', paddingTop: 8 }} />
                <Line
                  yAxisId="a"
                  type="monotone"
                  dataKey="a"
                  name={labelOf(metricA)}
                  stroke="#818CF8"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
                <Line
                  yAxisId="b"
                  type="monotone"
                  dataKey="b"
                  name={labelOf(metricB)}
                  stroke="#AAFF4D"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Correlation result */}
          {r !== null && (
            <Card variant="accent">
              <div className="flex items-start gap-5">
                <div className="text-center shrink-0">
                  <p className={`font-display text-4xl font-bold ${rColor}`}>
                    {r >= 0 ? '+' : ''}{r.toFixed(2)}
                  </p>
                  <p className="text-xs text-text3 mt-0.5">Pearson r</p>
                </div>
                <div>
                  <p className={`font-display font-bold text-base mb-1 ${rColor}`}>{description}</p>
                  <p className="text-text3 text-sm leading-relaxed">
                    {Math.abs(r) >= 0.6
                      ? `${labelOf(metricA)} and ${labelOf(metricB)} move together strongly. Changes in one are likely reflected in the other.`
                      : Math.abs(r) >= 0.3
                      ? `There is a moderate relationship between ${labelOf(metricA)} and ${labelOf(metricB)}. Other factors likely play a role.`
                      : `${labelOf(metricA)} and ${labelOf(metricB)} don't appear to be strongly linked over this period.`}
                  </p>
                  <p className="text-text3 text-xs mt-2">
                    Based on {Math.min(xs.length, ys.length)} overlapping data points
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {!ran && (
        <Card className="flex flex-col items-center py-16 gap-3">
          <GitCompareArrows size={32} className="text-text3" />
          <p className="text-text2 text-sm">Select two metrics above and hit Compare.</p>
        </Card>
      )}
    </div>
  );
}

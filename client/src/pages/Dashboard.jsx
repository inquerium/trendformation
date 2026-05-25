import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Dumbbell } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { getDashboardSummary } from '../api/dashboard.api.js';
import { StatCard } from '../components/ui/StatCard.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { formatDate, formatWeight } from '../utils/formatters.js';
import { staggerContainer, fadeUp } from '../utils/motionVariants.js';

const CHART_STYLE = {
  background: 'transparent',
  fontSize: 11,
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#1E2335',
    border: '1px solid #3A4160',
    borderRadius: 8,
    fontSize: 12,
    color: '#F4F6FF',
  },
  itemStyle: { color: '#F4F6FF' },
  labelStyle: { color: '#8B96B8', marginBottom: 2 },
};

function ChartEmpty() {
  return (
    <div className="flex items-center justify-center h-36 text-text3 text-sm">
      Log more data to see your trend
    </div>
  );
}

function greeting(name) {
  const h = new Date().getHours();
  const salutation = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return name ? `${salutation}, ${name.split(' ')[0]}` : salutation;
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then((res) => setSummary(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const w = summary?.weight;
  const sl = summary?.sleep;
  const caf = summary?.caffeine;
  const nut = summary?.nutrition?.today;
  const cal = summary?.calories?.today;
  const workouts = summary?.recentWorkouts ?? [];

  const weightUnit = w?.current?.unit ?? user?.weightUnit ?? 'lbs';
  const changePositive = w?.change != null ? w.change <= 0 : null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold text-text1">{greeting(user?.name)}</h1>
        <p className="text-text3 text-sm mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Current Weight"
          value={w?.current ? w.current.value.toFixed(1) : null}
          unit={weightUnit}
          delta={w?.change != null ? `${w.change > 0 ? '+' : ''}${w.change} ${weightUnit}` : undefined}
          deltaPositive={changePositive}
          muted={!w?.current}
        />
        <StatCard
          label="Avg Sleep (7d)"
          value={sl?.avgHours ?? null}
          unit={sl?.avgHours ? 'hrs' : ''}
          delta={sl?.avgScore != null ? `Score ${sl.avgScore}/100` : undefined}
          deltaPositive={sl?.avgScore != null ? sl.avgScore >= 70 : undefined}
          muted={!sl?.avgHours}
        />
        <StatCard
          label="Caffeine Today"
          value={caf?.todayMg ?? 0}
          unit="mg"
          delta={caf?.todayMg > 400 ? 'Over 400mg limit' : undefined}
          deltaPositive={false}
          muted={!caf?.todayMg}
        />
        <StatCard
          label="Calories Today"
          value={nut?.calories ?? null}
          unit={nut?.calories ? 'kcal' : ''}
          delta={
            cal?.active_calories != null
              ? `${cal.active_calories} burned`
              : undefined
          }
          deltaPositive={true}
          muted={!nut?.calories}
        />
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weight chart */}
        <motion.div variants={fadeUp}>
          <Card>
            <p className="text-xs text-text3 uppercase tracking-widest font-display mb-4">
              Weight — 30 days
            </p>
            {(w?.history?.length ?? 0) < 2 ? (
              <ChartEmpty />
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={w.history} style={CHART_STYLE} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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
                    tick={{ fill: '#8B96B8', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => v.toFixed(0)}
                  />
                  <Tooltip
                    {...TOOLTIP_STYLE}
                    labelFormatter={(d) => formatDate(d, 'MMM d, yyyy')}
                    formatter={(v) => [`${v} ${weightUnit}`, 'Weight']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#818CF8"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#818CF8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>

        {/* Sleep chart */}
        <motion.div variants={fadeUp}>
          <Card>
            <p className="text-xs text-text3 uppercase tracking-widest font-display mb-4">
              Sleep — 30 days
            </p>
            {(sl?.history?.length ?? 0) < 2 ? (
              <ChartEmpty />
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={sl.history} style={CHART_STYLE} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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
                    yAxisId="hours"
                    tick={{ fill: '#8B96B8', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 12]}
                  />
                  <YAxis
                    yAxisId="score"
                    orientation="right"
                    tick={{ fill: '#8B96B8', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    {...TOOLTIP_STYLE}
                    labelFormatter={(d) => formatDate(d, 'MMM d, yyyy')}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: '#8B96B8', paddingTop: 8 }}
                  />
                  <Line
                    yAxisId="hours"
                    type="monotone"
                    dataKey="hours"
                    name="Hours"
                    stroke="#818CF8"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="score"
                    type="monotone"
                    dataKey="score"
                    name="Score"
                    stroke="#AAFF4D"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Today's nutrition */}
      {nut && (
        <motion.div variants={fadeUp}>
          <Card>
            <p className="text-xs text-text3 uppercase tracking-widest font-display mb-3">Today's Nutrition</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Calories', value: nut.calories != null ? `${nut.calories}` : '—', unit: nut.calories != null ? 'kcal' : '' },
                { label: 'Protein', value: nut.protein_g != null ? `${nut.protein_g}` : '—', unit: nut.protein_g != null ? 'g' : '' },
                { label: 'Carbs', value: nut.carbs_g != null ? `${nut.carbs_g}` : '—', unit: nut.carbs_g != null ? 'g' : '' },
                { label: 'Fats', value: nut.fats_g != null ? `${nut.fats_g}` : '—', unit: nut.fats_g != null ? 'g' : '' },
              ].map(({ label, value, unit }) => (
                <div key={label} className="text-center">
                  <p className="text-xs text-text3 mb-0.5">{label}</p>
                  <p className="font-display font-bold text-text1">{value}<span className="text-xs text-text3 font-sans font-normal ml-0.5">{unit}</span></p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recent workouts */}
      {workouts.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <p className="text-xs text-text3 uppercase tracking-widest font-display mb-3">Recent Workouts</p>
            <div className="flex flex-col gap-2">
              {workouts.map((w, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo/10 flex items-center justify-center flex-shrink-0">
                    <Dumbbell size={13} className="text-indigo-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text1 font-medium truncate">{w.name || 'Workout'}</p>
                    <p className="text-xs text-text3">
                      {formatDate(w.logged_at, 'MMM d')}
                      {w.duration_min ? ` · ${w.duration_min} min` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

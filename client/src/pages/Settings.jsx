import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { LogOut, User, SlidersHorizontal, Upload, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useAuthStore } from '../store/authStore.js';
import { updateMeApi } from '../api/auth.api.js';
import { bulkImportApi } from '../api/import.api.js';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  weightUnit: z.enum(['lbs', 'kg']),
});

const IMPORT_CATEGORIES = [
  { value: 'weight',    label: 'Weight',           columns: 'date, weight, unit' },
  { value: 'sleep',     label: 'Sleep',             columns: 'date, hours_slept, sleep_score' },
  { value: 'caffeine',  label: 'Caffeine',          columns: 'date, mg, source' },
  { value: 'nutrition', label: 'Nutrition',         columns: 'date, calories, protein_g, carbs_g, fats_g' },
  { value: 'calories',  label: 'Calories Burned',   columns: 'date, active_calories, activity_type' },
];

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
  });
}

function Section({ icon: Icon, title, children }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-5">
        <Icon size={16} className="text-text3" />
        <p className="text-xs text-text3 uppercase tracking-widest font-display">{title}</p>
      </div>
      {children}
    </Card>
  );
}

function CSVImport() {
  const [category, setCategory] = useState('weight');
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const meta = IMPORT_CATEGORIES.find((c) => c.value === category);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result);
      setPreview(rows);
    };
    reader.readAsText(file);
  }

  async function doImport() {
    if (!preview?.length) return;
    setImporting(true);
    try {
      const res = await bulkImportApi(category, preview);
      toast.success(`Imported ${res.data.data.inserted} rows`);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const selectCls = 'bg-abyss border border-border rounded-lg px-4 py-2.5 text-text1 focus:outline-none focus:border-indigo text-sm transition-colors w-full';

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-text2 font-medium tracking-wide mb-1.5">Data type</p>
        <select value={category} onChange={(e) => { setCategory(e.target.value); reset(); }} className={selectCls}>
          {IMPORT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <p className="text-xs text-text3 mt-1.5">Expected columns: <code className="text-indigo-light">{meta?.columns}</code></p>
      </div>

      {!preview ? (
        <label className="flex flex-col items-center gap-3 border-2 border-dashed border-border hover:border-indigo/50 rounded-xl p-6 cursor-pointer transition-all">
          <Upload size={22} className="text-text3" />
          <div className="text-center">
            <p className="text-sm text-text2 font-medium">Choose a CSV file</p>
            <p className="text-xs text-text3 mt-0.5">First row must be column headers</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={handleFile} />
        </label>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 p-3 bg-surface3 rounded-lg">
            <FileText size={14} className="text-indigo-light shrink-0" />
            <p className="text-sm text-text1 flex-1">{preview.length} rows ready to import</p>
            <button onClick={reset} className="text-xs text-text3 hover:text-text1">Clear</button>
          </div>

          {preview.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface3">
                    {Object.keys(preview[0]).map((k) => (
                      <th key={k} className="px-3 py-2 text-left text-text3 font-medium whitespace-nowrap">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-text2 whitespace-nowrap">{v || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 5 && (
                <p className="text-xs text-text3 px-3 py-2 border-t border-border">…and {preview.length - 5} more rows</p>
              )}
            </div>
          )}

          <Button onClick={doImport} isLoading={importing} className="w-full">
            Import {preview.length} rows
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', weightUnit: user?.weightUnit ?? 'lbs' },
  });

  useEffect(() => {
    if (user) reset({ name: user.name ?? '', weightUnit: user.weightUnit ?? 'lbs' });
  }, [user?.name, user?.weightUnit]);

  const weightUnit = watch('weightUnit');

  async function onSubmit(data) {
    try {
      const res = await updateMeApi({ name: data.name, weightUnit: data.weightUnit });
      const updated = res.data.data.user;
      updateUser({ name: updated.name, weightUnit: updated.weightUnit });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    }
  }

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <h1 className="font-display text-2xl font-bold text-text1">Settings</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Section icon={User} title="Profile">
          <div className="flex flex-col gap-4">
            <Input label="Display name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
            <div>
              <p className="text-xs text-text2 font-medium tracking-wide mb-1">Email</p>
              <p className="text-sm text-text3 bg-abyss border border-border rounded-lg px-4 py-2.5 select-all">
                {user?.email ?? '—'}
              </p>
            </div>
          </div>
        </Section>

        <Section icon={SlidersHorizontal} title="Preferences">
          <div>
            <p className="text-xs text-text2 font-medium tracking-wide mb-3">Weight unit</p>
            <div className="flex gap-3">
              {['lbs', 'kg'].map((unit) => (
                <label
                  key={unit}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border cursor-pointer transition-all text-sm font-display font-bold uppercase tracking-widest ${
                    weightUnit === unit
                      ? 'bg-indigo/10 border-indigo/60 text-indigo-light'
                      : 'bg-abyss border-border text-text3 hover:border-border2'
                  }`}
                >
                  <input type="radio" value={unit} className="sr-only" {...register('weightUnit')} />
                  {unit}
                </label>
              ))}
            </div>
          </div>
        </Section>

        <Button type="submit" isLoading={isSubmitting} className="w-full">Save Changes</Button>
      </form>

      <Section icon={Upload} title="Import Data">
        <CSVImport />
      </Section>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <LogOut size={16} className="text-text3" />
          <p className="text-xs text-text3 uppercase tracking-widest font-display">Account</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text1 font-medium">Sign out</p>
            <p className="text-xs text-text3 mt-0.5">You'll need to log in again to access your data.</p>
          </div>
          <Button variant="danger" onClick={handleLogout}>Sign out</Button>
        </div>
      </Card>
    </div>
  );
}

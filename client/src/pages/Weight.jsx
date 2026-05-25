import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Scale } from 'lucide-react';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Select, Textarea } from '../components/ui/Input.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { weightSchema } from '../utils/validators.js';
import { formatDate, formatWeight } from '../utils/formatters.js';
import { useAuthStore } from '../store/authStore.js';
import { getWeightLogs, createWeightLog, updateWeightLog, deleteWeightLog } from '../api/weight.api.js';

const today = () => new Date().toISOString().split('T')[0];

export default function Weight() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const weightUnit = useAuthStore((s) => s.user?.weightUnit ?? 'lbs');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(weightSchema),
    defaultValues: { unit: weightUnit, logged_at: today() },
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getWeightLogs();
      setLogs(res.data.data);
    } catch { toast.error('Failed to load weight logs'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    reset({ weight: '', unit: weightUnit, logged_at: today(), note: '' });
    setOpen(true);
  }

  function openEdit(log) {
    setEditing(log);
    reset({ weight: log.weight, unit: log.unit, logged_at: log.logged_at, note: log.note ?? '' });
    setOpen(true);
  }

  function close() { setOpen(false); setEditing(null); }

  async function onSubmit(data) {
    try {
      if (editing) {
        const res = await updateWeightLog(editing.id, data);
        setLogs(logs.map((l) => (l.id === editing.id ? res.data.data : l)));
        toast.success('Updated');
      } else {
        const res = await createWeightLog(data);
        setLogs([res.data.data, ...logs]);
        toast.success('Weight logged');
      }
      close();
    } catch { toast.error('Failed to save'); }
  }

  async function onDelete(id) {
    try {
      await deleteWeightLog(id);
      setLogs(logs.filter((l) => l.id !== id));
      setDeletingId(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  }

  const latest = logs[0];
  const prev = logs[1];
  const change = latest && prev ? (Number(latest.weight) - Number(prev.weight)).toFixed(1) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-text1">Weight</h1>
        <Button onClick={openAdd}>
          <Plus size={15} />Log Weight
        </Button>
      </div>

      {latest && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card variant="accent">
            <p className="text-xs text-text3 uppercase tracking-widest mb-1">Current</p>
            <p className="font-display text-2xl font-bold text-text1">
              {formatWeight(latest.weight, latest.unit)}
            </p>
            <p className="text-xs text-text3 mt-0.5">{formatDate(latest.logged_at, 'MMM d, yyyy')}</p>
          </Card>
          <Card>
            <p className="text-xs text-text3 uppercase tracking-widest mb-1">Change</p>
            <p className={`font-display text-2xl font-bold ${change === null ? 'text-text2' : Number(change) < 0 ? 'text-success' : Number(change) > 0 ? 'text-danger' : 'text-text1'}`}>
              {change === null ? '—' : `${Number(change) > 0 ? '+' : ''}${change} ${latest.unit}`}
            </p>
            <p className="text-xs text-text3 mt-0.5">vs. previous entry</p>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : logs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-3">
          <Scale size={32} className="text-text3" />
          <p className="text-text2 text-sm">No weight logged yet.</p>
          <Button variant="ghost" onClick={openAdd}>Log your first entry</Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <Card key={log.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3">
                  <span className="font-display font-bold text-text1">
                    {formatWeight(log.weight, log.unit)}
                  </span>
                  <span className="text-xs text-text3">{formatDate(log.logged_at, 'MMM d, yyyy')}</span>
                </div>
                {log.note && <p className="text-xs text-text3 mt-0.5 truncate">{log.note}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {deletingId === log.id ? (
                  <>
                    <Button variant="danger" className="text-xs px-3 py-1.5" onClick={() => onDelete(log.id)}>Confirm</Button>
                    <Button variant="ghost" className="text-xs px-3 py-1.5" onClick={() => setDeletingId(null)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <button onClick={() => openEdit(log)} className="p-2 text-text3 hover:text-text1 transition-colors rounded-lg hover:bg-surface3">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeletingId(log.id)} className="p-2 text-text3 hover:text-danger transition-colors rounded-lg hover:bg-surface3">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={close} title={editing ? 'Edit Entry' : 'Log Weight'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Weight"
              type="number"
              step="0.1"
              placeholder="185.0"
              error={errors.weight?.message}
              {...register('weight')}
            />
            <Select label="Unit" error={errors.unit?.message} {...register('unit')}>
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </Select>
          </div>
          <Input label="Date" type="date" error={errors.logged_at?.message} {...register('logged_at')} />
          <Textarea label="Note (optional)" placeholder="How are you feeling?" {...register('note')} rows={2} />
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {editing ? 'Save Changes' : 'Log Weight'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

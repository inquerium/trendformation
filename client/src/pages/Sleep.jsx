import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Moon } from 'lucide-react';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { sleepSchema } from '../utils/validators.js';
import { formatDate } from '../utils/formatters.js';
import { getSleepLogs, createSleepLog, updateSleepLog, deleteSleepLog } from '../api/sleep.api.js';

const today = () => new Date().toISOString().split('T')[0];

function scoreColor(score) {
  if (score == null) return 'text-text3';
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-danger';
}

function fmt12(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${((h % 12) || 12)}:${String(m).padStart(2, '0')}${ampm}`;
}

export default function Sleep() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(sleepSchema),
    defaultValues: { logged_at: today() },
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getSleepLogs();
      setLogs(res.data.data);
    } catch { toast.error('Failed to load sleep logs'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    reset({ logged_at: today(), hours_slept: '', sleep_score: '', bed_time: '', wake_time: '', notes: '' });
    setOpen(true);
  }

  function openEdit(log) {
    setEditing(log);
    reset({
      logged_at: log.logged_at,
      hours_slept: log.hours_slept,
      sleep_score: log.sleep_score ?? '',
      bed_time: log.bed_time ?? '',
      wake_time: log.wake_time ?? '',
      notes: log.notes ?? '',
    });
    setOpen(true);
  }

  function close() { setOpen(false); setEditing(null); }

  async function onSubmit(data) {
    const payload = {
      ...data,
      sleep_score: data.sleep_score === '' ? null : data.sleep_score,
      bed_time: data.bed_time || null,
      wake_time: data.wake_time || null,
    };
    try {
      if (editing) {
        const res = await updateSleepLog(editing.id, payload);
        setLogs(logs.map((l) => (l.id === editing.id ? res.data.data : l)));
        toast.success('Updated');
      } else {
        const res = await createSleepLog(payload);
        setLogs([res.data.data, ...logs]);
        toast.success('Sleep logged');
      }
      close();
    } catch { toast.error('Failed to save'); }
  }

  async function onDelete(id) {
    try {
      await deleteSleepLog(id);
      setLogs(logs.filter((l) => l.id !== id));
      setDeletingId(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-text1">Sleep</h1>
        <Button onClick={openAdd}><Plus size={15} />Log Sleep</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : logs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-3">
          <Moon size={32} className="text-text3" />
          <p className="text-text2 text-sm">No sleep logged yet.</p>
          <Button variant="ghost" onClick={openAdd}>Log your first night</Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <Card key={log.id} className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap mb-1">
                  <span className="text-xs text-text3">{formatDate(log.logged_at, 'MMM d, yyyy')}</span>
                  <span className="font-display font-bold text-text1">
                    {Number(log.hours_slept).toFixed(1)}h
                  </span>
                  {log.sleep_score != null && (
                    <span className={`font-display font-bold text-sm ${scoreColor(log.sleep_score)}`}>
                      {log.sleep_score}/100
                    </span>
                  )}
                </div>
                {(log.bed_time || log.wake_time) && (
                  <p className="text-xs text-text3">
                    {fmt12(log.bed_time) ?? '?'} → {fmt12(log.wake_time) ?? '?'}
                  </p>
                )}
                {log.notes && <p className="text-xs text-text3 mt-1 truncate">{log.notes}</p>}
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

      <Modal isOpen={open} onClose={close} title={editing ? 'Edit Sleep' : 'Log Sleep'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Date" type="date" error={errors.logged_at?.message} {...register('logged_at')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Hours slept" type="number" step="0.25" min="0" max="24" placeholder="7.5" error={errors.hours_slept?.message} {...register('hours_slept')} />
            <Input label="Sleep score (0-100)" type="number" min="0" max="100" placeholder="82" error={errors.sleep_score?.message} {...register('sleep_score')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Bed time" type="time" error={errors.bed_time?.message} {...register('bed_time')} />
            <Input label="Wake time" type="time" error={errors.wake_time?.message} {...register('wake_time')} />
          </div>
          <Textarea label="Notes (optional)" placeholder="Fell asleep quickly..." {...register('notes')} rows={2} />
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {editing ? 'Save Changes' : 'Log Sleep'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

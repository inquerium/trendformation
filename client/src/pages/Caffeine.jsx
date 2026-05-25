import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Coffee } from 'lucide-react';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { caffeineSchema } from '../utils/validators.js';
import { formatDate } from '../utils/formatters.js';
import { getCaffeineLogs, createCaffeineLog, updateCaffeineLog, deleteCaffeineLog } from '../api/caffeine.api.js';

const today = () => new Date().toISOString().split('T')[0];

function fmt12(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${((h % 12) || 12)}:${String(m).padStart(2, '0')}${ampm}`;
}

export default function Caffeine() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(caffeineSchema),
    defaultValues: { logged_at: today() },
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getCaffeineLogs();
      setLogs(res.data.data);
    } catch { toast.error('Failed to load caffeine logs'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    reset({ logged_at: today(), mg: '', source: '', logged_time: '', notes: '' });
    setOpen(true);
  }

  function openEdit(log) {
    setEditing(log);
    reset({
      logged_at: log.logged_at,
      mg: log.mg,
      source: log.source ?? '',
      logged_time: log.logged_time ?? '',
      notes: log.notes ?? '',
    });
    setOpen(true);
  }

  function close() { setOpen(false); setEditing(null); }

  async function onSubmit(data) {
    const payload = { ...data, logged_time: data.logged_time || null };
    try {
      if (editing) {
        const res = await updateCaffeineLog(editing.id, payload);
        setLogs(logs.map((l) => (l.id === editing.id ? res.data.data : l)));
        toast.success('Updated');
      } else {
        const res = await createCaffeineLog(payload);
        setLogs([res.data.data, ...logs]);
        toast.success('Caffeine logged');
      }
      close();
    } catch { toast.error('Failed to save'); }
  }

  async function onDelete(id) {
    try {
      await deleteCaffeineLog(id);
      setLogs(logs.filter((l) => l.id !== id));
      setDeletingId(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  }

  const dailyTotal = logs
    .filter((l) => l.logged_at === today())
    .reduce((sum, l) => sum + Number(l.mg), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-text1">Caffeine</h1>
        <Button onClick={openAdd}><Plus size={15} />Log Caffeine</Button>
      </div>

      {dailyTotal > 0 && (
        <Card variant="accent" className="mb-6 flex items-center gap-3">
          <Coffee size={20} className="text-indigo-light shrink-0" />
          <div>
            <p className="text-xs text-text3 uppercase tracking-widest">Today's total</p>
            <p className="font-display font-bold text-text1">{dailyTotal} mg</p>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : logs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-3">
          <Coffee size={32} className="text-text3" />
          <p className="text-text2 text-sm">No caffeine logged yet.</p>
          <Button variant="ghost" onClick={openAdd}>Log your first dose</Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <Card key={log.id} className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap mb-1">
                  <span className="text-xs text-text3">{formatDate(log.logged_at, 'MMM d, yyyy')}</span>
                  {log.logged_time && (
                    <span className="text-xs text-text3">{fmt12(log.logged_time)}</span>
                  )}
                  <span className="font-display font-bold text-text1">{log.mg} mg</span>
                  {log.source && <span className="text-sm text-text2">{log.source}</span>}
                </div>
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

      <Modal isOpen={open} onClose={close} title={editing ? 'Edit Entry' : 'Log Caffeine'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" error={errors.logged_at?.message} {...register('logged_at')} />
            <Input label="Time (optional)" type="time" error={errors.logged_time?.message} {...register('logged_time')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Milligrams" type="number" min="1" placeholder="200" error={errors.mg?.message} {...register('mg')} />
            <Input label="Source (optional)" placeholder="Coffee, espresso..." error={errors.source?.message} {...register('source')} />
          </div>
          <Textarea label="Notes (optional)" {...register('notes')} rows={2} />
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {editing ? 'Save Changes' : 'Log Caffeine'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

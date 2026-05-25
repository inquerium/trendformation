import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Flame } from 'lucide-react';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { calorieBurnSchema } from '../utils/validators.js';
import { formatDate } from '../utils/formatters.js';
import { getCalorieBurnLogs, createCalorieBurnLog, updateCalorieBurnLog, deleteCalorieBurnLog } from '../api/calories.api.js';

const today = () => new Date().toISOString().split('T')[0];

export default function Calories() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(calorieBurnSchema),
    defaultValues: { logged_at: today() },
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getCalorieBurnLogs();
      setLogs(res.data.data);
    } catch { toast.error('Failed to load calorie logs'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    reset({ logged_at: today(), active_calories: '', passive_calories: '', activity_type: '', notes: '' });
    setOpen(true);
  }

  function openEdit(log) {
    setEditing(log);
    reset({
      logged_at: log.logged_at,
      active_calories: log.active_calories ?? '',
      passive_calories: log.passive_calories ?? '',
      activity_type: log.activity_type ?? '',
      notes: log.notes ?? '',
    });
    setOpen(true);
  }

  function close() { setOpen(false); setEditing(null); }

  async function onSubmit(data) {
    const payload = {
      ...data,
      active_calories: data.active_calories === '' ? null : data.active_calories,
      passive_calories: data.passive_calories === '' ? null : data.passive_calories,
    };
    try {
      if (editing) {
        const res = await updateCalorieBurnLog(editing.id, payload);
        setLogs(logs.map((l) => (l.id === editing.id ? res.data.data : l)));
        toast.success('Updated');
      } else {
        const res = await createCalorieBurnLog(payload);
        setLogs([res.data.data, ...logs]);
        toast.success('Burn logged');
      }
      close();
    } catch { toast.error('Failed to save'); }
  }

  async function onDelete(id) {
    try {
      await deleteCalorieBurnLog(id);
      setLogs(logs.filter((l) => l.id !== id));
      setDeletingId(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-text1">Calories Burned</h1>
        <Button onClick={openAdd}><Plus size={15} />Log Burn</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : logs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-3">
          <Flame size={32} className="text-text3" />
          <p className="text-text2 text-sm">No calorie burns logged yet.</p>
          <Button variant="ghost" onClick={openAdd}>Log your first burn</Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <Card key={log.id} className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap mb-1">
                  <span className="text-xs text-text3">{formatDate(log.logged_at, 'MMM d, yyyy')}</span>
                  {log.active_calories != null && (
                    <span className="font-display font-bold text-text1">{log.active_calories} active</span>
                  )}
                  {log.passive_calories != null && (
                    <span className="text-sm text-text2">+{log.passive_calories} passive</span>
                  )}
                </div>
                {log.activity_type && <p className="text-xs text-text3">{log.activity_type}</p>}
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

      <Modal isOpen={open} onClose={close} title={editing ? 'Edit Burn' : 'Log Calorie Burn'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Date" type="date" error={errors.logged_at?.message} {...register('logged_at')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Active calories" type="number" min="0" placeholder="450" error={errors.active_calories?.message} {...register('active_calories')} />
            <Input label="Passive calories" type="number" min="0" placeholder="1800" error={errors.passive_calories?.message} {...register('passive_calories')} />
          </div>
          <Input label="Activity type (optional)" placeholder="Running, cycling..." error={errors.activity_type?.message} {...register('activity_type')} />
          <Textarea label="Notes (optional)" {...register('notes')} rows={2} />
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {editing ? 'Save Changes' : 'Log Burn'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

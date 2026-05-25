import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Salad } from 'lucide-react';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { nutritionSchema } from '../utils/validators.js';
import { formatDate } from '../utils/formatters.js';
import { getNutritionLogs, createNutritionLog, updateNutritionLog, deleteNutritionLog } from '../api/nutrition.api.js';

const today = () => new Date().toISOString().split('T')[0];

function MacroBar({ label, value, color }) {
  if (value == null) return null;
  return (
    <span className={`text-xs font-display font-bold ${color}`}>
      {label} <span className="font-sans font-normal text-text3">{value}g</span>
    </span>
  );
}

export default function Nutrition() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(nutritionSchema),
    defaultValues: { logged_at: today() },
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getNutritionLogs();
      setLogs(res.data.data);
    } catch { toast.error('Failed to load nutrition logs'); }
    finally { setLoading(false); }
  }

  // If today already has an entry, open edit for it; otherwise open add
  function logToday() {
    const todayEntry = logs.find((l) => l.logged_at === today());
    if (todayEntry) {
      openEdit(todayEntry);
    } else {
      openAdd();
    }
  }

  function openAdd() {
    setEditing(null);
    reset({ logged_at: today(), calories: '', protein_g: '', carbs_g: '', fats_g: '', notes: '' });
    setOpen(true);
  }

  function openEdit(log) {
    setEditing(log);
    reset({
      logged_at: log.logged_at,
      calories: log.calories ?? '',
      protein_g: log.protein_g ?? '',
      carbs_g: log.carbs_g ?? '',
      fats_g: log.fats_g ?? '',
      notes: log.notes ?? '',
    });
    setOpen(true);
  }

  function close() { setOpen(false); setEditing(null); }

  async function onSubmit(data) {
    const payload = {
      ...data,
      calories: data.calories === '' ? null : data.calories,
      protein_g: data.protein_g === '' ? null : data.protein_g,
      carbs_g: data.carbs_g === '' ? null : data.carbs_g,
      fats_g: data.fats_g === '' ? null : data.fats_g,
    };
    try {
      if (editing) {
        const res = await updateNutritionLog(editing.id, payload);
        setLogs(logs.map((l) => (l.id === editing.id ? res.data.data : l)));
        toast.success('Updated');
      } else {
        const res = await createNutritionLog(payload);
        setLogs([res.data.data, ...logs]);
        toast.success('Nutrition logged');
      }
      close();
    } catch { toast.error('Failed to save'); }
  }

  async function onDelete(id) {
    try {
      await deleteNutritionLog(id);
      setLogs(logs.filter((l) => l.id !== id));
      setDeletingId(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  }

  const todayLogged = logs.some((l) => l.logged_at === today());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-text1">Nutrition</h1>
        <Button onClick={logToday}>
          <Plus size={15} />{todayLogged ? "Edit Today's Intake" : "Log Today's Intake"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : logs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-3">
          <Salad size={32} className="text-text3" />
          <p className="text-text2 text-sm">No nutrition logged yet.</p>
          <Button variant="ghost" onClick={openAdd}>Log today's intake</Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <Card key={log.id} className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap mb-1.5">
                  <span className="text-xs text-text3">{formatDate(log.logged_at, 'MMM d, yyyy')}</span>
                  {log.calories != null && (
                    <span className="font-display font-bold text-text1">{log.calories} kcal</span>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <MacroBar label="Protein" value={log.protein_g} color="text-indigo-light" />
                  <MacroBar label="Carbs" value={log.carbs_g} color="text-amber" />
                  <MacroBar label="Fats" value={log.fats_g} color="text-success" />
                </div>
                {log.notes && <p className="text-xs text-text3 mt-1.5 truncate">{log.notes}</p>}
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

      <Modal isOpen={open} onClose={close} title={editing ? "Edit Daily Intake" : "Log Daily Intake"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Date" type="date" error={errors.logged_at?.message} {...register('logged_at')} />
          <Input
            label="Total calories"
            type="number"
            min="0"
            placeholder="2200"
            error={errors.calories?.message}
            {...register('calories')}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Protein (g)"
              type="number"
              min="0"
              step="0.1"
              placeholder="150"
              error={errors.protein_g?.message}
              {...register('protein_g')}
            />
            <Input
              label="Carbs (g)"
              type="number"
              min="0"
              step="0.1"
              placeholder="250"
              error={errors.carbs_g?.message}
              {...register('carbs_g')}
            />
            <Input
              label="Fats (g)"
              type="number"
              min="0"
              step="0.1"
              placeholder="70"
              error={errors.fats_g?.message}
              {...register('fats_g')}
            />
          </div>
          <Textarea label="Notes (optional)" placeholder="Cheat day, high protein focus…" {...register('notes')} rows={2} />
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {editing ? 'Save Changes' : 'Log Intake'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

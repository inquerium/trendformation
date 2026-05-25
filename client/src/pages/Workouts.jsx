import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Dumbbell, ChevronDown, ChevronRight, X, ChevronLeft, Play, CheckCircle2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Select, Textarea } from '../components/ui/Input.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { workoutSchema } from '../utils/validators.js';
import { formatDate } from '../utils/formatters.js';
import {
  getWorkoutSessions,
  createWorkoutSession,
  updateWorkoutSession,
  deleteWorkoutSession,
} from '../api/workout.api.js';
import { useAuthStore } from '../store/authStore.js';

const today = () => new Date().toISOString().split('T')[0];

const defaultSet = (unit) => ({ reps: '', weight: '', weight_unit: unit });
const defaultExercise = (unit) => ({ exercise: '', sets: [defaultSet(unit)] });

function groupByExercise(rows) {
  const groups = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (last && last.name === row.exercise) last.rows.push(row);
    else groups.push({ name: row.exercise, rows: [row] });
  }
  return groups;
}

function toFormExercises(rows, defaultUnit) {
  return groupByExercise(rows).map(({ name, rows: setRows }) => ({
    exercise: name,
    sets: setRows.map((r) => ({
      reps: r.reps ?? '',
      weight: r.weight ?? '',
      weight_unit: r.weight_unit ?? defaultUnit,
    })),
  }));
}

function formatElapsed(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// --- ExerciseBlock for the log/edit modal ---
function ExerciseBlock({ idx, control, register, errors, removeExercise, weightUnit, isOnly }) {
  const { fields, append, remove: removeSet } = useFieldArray({
    control,
    name: `exercises.${idx}.sets`,
  });

  return (
    <div className="bg-abyss rounded-xl p-4 flex flex-col gap-3 border border-border/50">
      <div className="flex items-center gap-2">
        <Input
          placeholder={`Exercise ${idx + 1} name`}
          error={errors?.exercises?.[idx]?.exercise?.message}
          className="flex-1"
          {...register(`exercises.${idx}.exercise`)}
        />
        {!isOnly && (
          <button type="button" onClick={removeExercise} className="p-1.5 text-text3 hover:text-danger transition-colors rounded-lg shrink-0">
            <X size={15} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-[28px_1fr_1fr_52px_24px] gap-2 px-1">
          <span className="text-[10px] text-text3 uppercase tracking-wide text-center">#</span>
          <span className="text-[10px] text-text3 uppercase tracking-wide">Weight</span>
          <span className="text-[10px] text-text3 uppercase tracking-wide">Reps</span>
          <span className="text-[10px] text-text3 uppercase tracking-wide">Unit</span>
          <span />
        </div>
        {fields.map((set, sIdx) => (
          <div key={set.id} className="grid grid-cols-[28px_1fr_1fr_52px_24px] gap-2 items-center">
            <span className="text-xs text-text3 text-center font-display">{sIdx + 1}</span>
            <Input type="number" min="0" step="0.5" placeholder="0" {...register(`exercises.${idx}.sets.${sIdx}.weight`)} />
            <Input type="number" min="0" placeholder="0" {...register(`exercises.${idx}.sets.${sIdx}.reps`)} />
            <Select {...register(`exercises.${idx}.sets.${sIdx}.weight_unit`)}>
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </Select>
            {fields.length > 1 ? (
              <button type="button" onClick={() => removeSet(sIdx)} className="p-1 text-text3 hover:text-danger transition-colors rounded">
                <X size={12} />
              </button>
            ) : <span />}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => append(defaultSet(weightUnit))}
        className="text-xs text-indigo-light hover:text-indigo flex items-center gap-1.5 transition-colors self-start"
      >
        <Plus size={12} /> Add Set
      </button>
    </div>
  );
}

// --- Active Gym Mode ---
function ActiveWorkout({ gymName, gymExercises, weightUnit, onFinish, onCancel }) {
  const [activeSets, setActiveSets] = useState(
    () => Object.fromEntries(gymExercises.map((e) => [e, []]))
  );
  const [loggingExercise, setLoggingExercise] = useState(null);
  const [pendingWeight, setPendingWeight] = useState('');
  const [pendingReps, setPendingReps] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const weightInputRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  function openLog(name) {
    const sets = activeSets[name] ?? [];
    const last = sets[sets.length - 1];
    setPendingWeight(last?.weight != null ? String(last.weight) : '');
    setPendingReps(last?.reps != null ? String(last.reps) : '');
    setLoggingExercise(name);
    setTimeout(() => weightInputRef.current?.focus(), 80);
  }

  function confirmSet() {
    const w = pendingWeight === '' ? null : parseFloat(pendingWeight);
    const r = pendingReps === '' ? null : parseInt(pendingReps, 10);
    setActiveSets((prev) => ({
      ...prev,
      [loggingExercise]: [...(prev[loggingExercise] ?? []), { weight: w, reps: r, weight_unit: weightUnit }],
    }));
    setPendingWeight('');
    setPendingReps('');
    setLoggingExercise(null);
  }

  function cancelLog() {
    setLoggingExercise(null);
    setPendingWeight('');
    setPendingReps('');
  }

  const totalSets = Object.values(activeSets).reduce((n, sets) => n + sets.length, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Timer + Finish */}
      <div className="flex items-center justify-between bg-surface2 rounded-2xl px-5 py-4 border border-border">
        <div>
          <p className="text-3xl font-display font-bold text-text1 tabular-nums">{formatElapsed(elapsed)}</p>
          <p className="text-xs text-text3 mt-0.5">{gymName || 'Active workout'} · {totalSets} set{totalSets !== 1 ? 's' : ''} logged</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Button
            variant="phosphor"
            className="!text-xs !px-4 !py-2.5 !rounded-lg"
            onClick={() => onFinish(activeSets, Math.round(elapsed / 60))}
          >
            <CheckCircle2 size={14} /> Finish
          </Button>
          <button onClick={onCancel} className="text-xs text-text3 hover:text-text1 transition-colors">Discard</button>
        </div>
      </div>

      {/* Exercise cards */}
      <div className="flex flex-col gap-3">
        {gymExercises.map((name) => {
          const sets = activeSets[name] ?? [];
          const isLogging = loggingExercise === name;
          return (
            <Card key={name}>
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell size={14} className="text-indigo-light shrink-0" />
                <p className="font-display font-bold text-text1">{name}</p>
                <span className="ml-auto text-xs text-text3">{sets.length} set{sets.length !== 1 ? 's' : ''}</span>
              </div>

              {sets.length > 0 && (
                <div className="flex flex-col gap-1 mb-3">
                  {sets.map((set, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-xs text-text3 w-10 shrink-0">Set {i + 1}</span>
                      <span className="text-text2">
                        {set.weight != null ? `${set.weight} ${set.weight_unit}` : <span className="text-text3">—</span>}
                      </span>
                      <span className="text-text3">×</span>
                      <span className="text-text2">
                        {set.reps != null ? `${set.reps} reps` : <span className="text-text3">—</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {isLogging ? (
                <div className="flex flex-col gap-3 pt-2 border-t border-border">
                  <p className="text-xs text-text3 font-display uppercase tracking-wide">Set {sets.length + 1}</p>
                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-text3">Weight ({weightUnit})</span>
                      <input
                        ref={weightInputRef}
                        type="number"
                        inputMode="decimal"
                        value={pendingWeight}
                        onChange={(e) => setPendingWeight(e.target.value)}
                        placeholder="0"
                        className="w-full bg-abyss border-2 border-indigo rounded-xl text-4xl font-display font-bold text-text1 text-center focus:outline-none py-3 leading-none"
                      />
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-text3">Reps</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={pendingReps}
                        onChange={(e) => setPendingReps(e.target.value)}
                        placeholder="0"
                        className="w-full bg-abyss border-2 border-indigo rounded-xl text-4xl font-display font-bold text-text1 text-center focus:outline-none py-3 leading-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={confirmSet} className="flex-1">Log Set</Button>
                    <Button variant="ghost" onClick={cancelLog}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openLog(name)}
                  className="w-full py-3.5 rounded-xl border-2 border-dashed border-border hover:border-indigo/50 active:scale-[0.98] text-text3 hover:text-indigo-light transition-all text-sm flex items-center justify-center gap-2 font-display font-bold tracking-wide"
                >
                  <Plus size={16} /> Log Set {sets.length + 1}
                </button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// --- Workout Setup Screen ---
function WorkoutSetup({ onStart, onCancel, weightUnit }) {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState(['']);

  function addExercise() { setExercises((p) => [...p, '']); }
  function removeExercise(i) { setExercises((p) => p.filter((_, j) => j !== i)); }
  function setExerciseName(i, val) { setExercises((p) => p.map((e, j) => (j === i ? val : e))); }

  const valid = exercises.some((e) => e.trim());

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-2 text-text3 hover:text-text1 transition-colors rounded-lg hover:bg-surface3">
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-display text-xl font-bold text-text1">Setup Workout</h2>
      </div>

      <Input
        label="Workout name (optional)"
        placeholder="Push Day, Pull Day, Legs…"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div>
        <p className="text-xs text-text2 font-medium uppercase tracking-wide mb-3">Exercises</p>
        <div className="flex flex-col gap-2">
          {exercises.map((ex, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                placeholder={`Exercise ${i + 1}`}
                value={ex}
                onChange={(e) => setExerciseName(i, e.target.value)}
                className="flex-1"
              />
              {exercises.length > 1 && (
                <button
                  onClick={() => removeExercise(i)}
                  className="p-2 text-text3 hover:text-danger transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addExercise} className="mt-3 text-sm text-indigo-light hover:text-indigo flex items-center gap-1.5 transition-colors">
          <Plus size={14} /> Add Exercise
        </button>
      </div>

      <Button
        onClick={() => onStart(name, exercises.filter((e) => e.trim()))}
        disabled={!valid}
        className="w-full !py-4 !text-sm"
      >
        <Play size={16} /> Start Workout
      </Button>
    </div>
  );
}

// --- Main Page ---
export default function Workouts() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [gymView, setGymView] = useState('history'); // 'history' | 'setup' | 'active'
  const [gymConfig, setGymConfig] = useState({ name: '', exercises: [] });
  const weightUnit = useAuthStore((s) => s.user?.weightUnit ?? 'lbs');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, control } = useForm({
    resolver: zodResolver(workoutSchema),
    defaultValues: { logged_at: today(), name: '', duration_min: '', notes: '', exercises: [defaultExercise(weightUnit)] },
  });

  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } =
    useFieldArray({ control, name: 'exercises' });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getWorkoutSessions();
      setSessions(res.data.data);
    } catch { toast.error('Failed to load workouts'); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    reset({ logged_at: today(), name: '', duration_min: '', notes: '', exercises: [defaultExercise(weightUnit)] });
    setOpen(true);
  }

  function openEdit(session) {
    setEditing(session);
    const exRows = session.workout_exercises ?? [];
    reset({
      logged_at: session.logged_at,
      name: session.name ?? '',
      duration_min: session.duration_min ?? '',
      notes: session.notes ?? '',
      exercises: exRows.length ? toFormExercises(exRows, weightUnit) : [defaultExercise(weightUnit)],
    });
    setOpen(true);
  }

  function close() { setOpen(false); setEditing(null); }

  async function onSubmit(data) {
    const payload = {
      ...data,
      duration_min: data.duration_min === '' ? null : data.duration_min,
      exercises: data.exercises
        .filter((ex) => ex.exercise.trim())
        .map((ex) => ({
          exercise: ex.exercise,
          sets: ex.sets.map((s) => ({
            reps: s.reps === '' ? null : Number(s.reps),
            weight: s.weight === '' ? null : Number(s.weight),
            weight_unit: s.weight_unit,
          })),
        })),
    };
    try {
      if (editing) {
        const res = await updateWorkoutSession(editing.id, payload);
        setSessions(sessions.map((s) => (s.id === editing.id ? res.data.data : s)));
        toast.success('Updated');
      } else {
        const res = await createWorkoutSession(payload);
        setSessions([res.data.data, ...sessions]);
        setExpandedId(res.data.data.id);
        toast.success('Workout logged');
      }
      close();
    } catch { toast.error('Failed to save'); }
  }

  async function onDelete(id) {
    try {
      await deleteWorkoutSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
      setDeletingId(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  }

  async function handleFinishWorkout(activeSets, durationMin) {
    const exercises = Object.entries(activeSets)
      .filter(([, sets]) => sets.length > 0)
      .map(([name, sets]) => ({ exercise: name, sets }));

    try {
      const res = await createWorkoutSession({
        name: gymConfig.name || undefined,
        logged_at: today(),
        duration_min: durationMin || null,
        exercises,
      });
      setSessions((prev) => [res.data.data, ...prev]);
      setExpandedId(res.data.data.id);
      setGymView('history');
      toast.success('Workout saved!');
    } catch { toast.error('Failed to save workout'); }
  }

  // Gym setup → active
  if (gymView === 'setup') {
    return (
      <WorkoutSetup
        weightUnit={weightUnit}
        onStart={(name, exercises) => {
          setGymConfig({ name, exercises });
          setGymView('active');
        }}
        onCancel={() => setGymView('history')}
      />
    );
  }

  if (gymView === 'active') {
    return (
      <ActiveWorkout
        gymName={gymConfig.name}
        gymExercises={gymConfig.exercises}
        weightUnit={weightUnit}
        onFinish={handleFinishWorkout}
        onCancel={() => setGymView('history')}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-text1">Workouts</h1>
        <div className="flex items-center gap-2">
          <Button variant="phosphor" onClick={() => setGymView('setup')} className="!text-xs !px-4 !py-2.5 !rounded-lg">
            <Play size={14} /> Start
          </Button>
          <Button variant="secondary" onClick={openAdd}><Plus size={15} />Log Past</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : sessions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 gap-4">
          <Dumbbell size={32} className="text-text3" />
          <p className="text-text2 text-sm">No workouts logged yet.</p>
          <div className="flex gap-3">
            <Button variant="phosphor" onClick={() => setGymView('setup')} className="!text-xs !px-4 !py-2.5 !rounded-lg">
              <Play size={14} /> Start Workout
            </Button>
            <Button variant="ghost" onClick={openAdd}>Log past workout</Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((session) => {
            const expanded = expandedId === session.id;
            const groups = groupByExercise(session.workout_exercises ?? []);
            return (
              <Card key={session.id} className="p-0 overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer active:bg-surface3 hover:bg-surface3 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : session.id)}
                >
                  <div className="text-text3">
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-display font-bold text-text1">{session.name || 'Workout'}</span>
                      {session.duration_min && <span className="text-xs text-text3">{session.duration_min} min</span>}
                    </div>
                    <p className="text-xs text-text3">
                      {formatDate(session.logged_at, 'MMM d, yyyy')}
                      {groups.length > 0 && ` · ${groups.length} exercise${groups.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {deletingId === session.id ? (
                      <>
                        <Button variant="danger" className="text-xs px-3 py-1.5" onClick={() => onDelete(session.id)}>Confirm</Button>
                        <Button variant="ghost" className="text-xs px-3 py-1.5" onClick={() => setDeletingId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => openEdit(session)} className="p-2 text-text3 hover:text-text1 transition-colors rounded-lg hover:bg-surface3">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeletingId(session.id)} className="p-2 text-text3 hover:text-danger transition-colors rounded-lg hover:bg-surface3">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    {groups.length === 0 ? (
                      <p className="text-xs text-text3 italic">No exercises logged.</p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {groups.map((group, gIdx) => (
                          <div key={gIdx}>
                            <p className="text-sm font-display font-bold text-text1 mb-1.5">{group.name}</p>
                            <div className="flex flex-col gap-1">
                              {group.rows.map((row, rIdx) => (
                                <div key={row.id} className="flex items-center gap-3 text-sm text-text2">
                                  <span className="text-xs text-text3 w-10">Set {rIdx + 1}</span>
                                  <span>{row.weight != null ? `${row.weight} ${row.weight_unit}` : <span className="text-text3">—</span>}</span>
                                  <span className="text-text3">×</span>
                                  <span>{row.reps != null ? `${row.reps} reps` : <span className="text-text3">—</span>}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {session.notes && (
                      <p className="text-xs text-text3 mt-3 italic border-t border-border pt-3">{session.notes}</p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={open} onClose={close} title={editing ? 'Edit Workout' : 'Log Past Workout'} size="2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Workout name (optional)" placeholder="Push Day, Legs…" error={errors.name?.message} {...register('name')} />
            <Input label="Date" type="date" error={errors.logged_at?.message} {...register('logged_at')} />
          </div>
          <Input label="Duration (min, optional)" type="number" min="0" placeholder="60" error={errors.duration_min?.message} {...register('duration_min')} />

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-text2 font-medium uppercase tracking-wide">Exercises</p>
              <button type="button" onClick={() => appendExercise(defaultExercise(weightUnit))} className="text-xs text-indigo-light hover:text-indigo flex items-center gap-1 transition-colors">
                <Plus size={13} /> Add Exercise
              </button>
            </div>
            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              {exerciseFields.map((field, i) => (
                <ExerciseBlock
                  key={field.id}
                  idx={i}
                  control={control}
                  register={register}
                  errors={errors}
                  removeExercise={() => removeExercise(i)}
                  weightUnit={weightUnit}
                  isOnly={exerciseFields.length === 1}
                />
              ))}
            </div>
          </div>

          <Textarea label="Session notes (optional)" placeholder="Felt strong today…" {...register('notes')} rows={2} />
          <Button type="submit" isLoading={isSubmitting} className="w-full">{editing ? 'Save Changes' : 'Log Workout'}</Button>
        </form>
      </Modal>
    </div>
  );
}

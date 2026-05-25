import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { Mic, MicOff, Loader2, CheckSquare, Square, Scale, Moon, Coffee, Salad, Flame, Dumbbell } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { Textarea } from './Input.jsx';
import { parseVoiceTranscript } from '../../api/voice.api.js';
import { createWeightLog } from '../../api/weight.api.js';
import { createSleepLog } from '../../api/sleep.api.js';
import { createCaffeineLog } from '../../api/caffeine.api.js';
import { createNutritionLog } from '../../api/nutrition.api.js';
import { createCalorieBurnLog } from '../../api/calories.api.js';
import { createWorkoutSession } from '../../api/workout.api.js';

const today = () => new Date().toISOString().split('T')[0];

const CATEGORY_META = {
  weight: { label: 'Weight', Icon: Scale, color: 'text-indigo-light' },
  sleep: { label: 'Sleep', Icon: Moon, color: 'text-indigo-light' },
  caffeine: { label: 'Caffeine', Icon: Coffee, color: 'text-amber' },
  nutrition: { label: 'Nutrition', Icon: Salad, color: 'text-success' },
  calories: { label: 'Calories Burned', Icon: Flame, color: 'text-danger' },
  workout: { label: 'Workout', Icon: Dumbbell, color: 'text-phosphor-dim' },
};

async function saveEntry(entry) {
  const d = { logged_at: today(), ...entry.data };
  switch (entry.category) {
    case 'weight':    return createWeightLog({ ...d, unit: d.unit ?? 'lbs' });
    case 'sleep':     return createSleepLog(d);
    case 'caffeine':  return createCaffeineLog({ ...d, mg: d.mg ?? 0 });
    case 'nutrition': return createNutritionLog(d);
    case 'calories':  return createCalorieBurnLog(d);
    case 'workout':   return createWorkoutSession({ ...d, exercises: [] });
    default: return null;
  }
}

export function VoiceModal({ isOpen, onClose }) {
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing] = useState(false);
  const [entries, setEntries] = useState(null);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  function reset() {
    setTranscript('');
    setEntries(null);
    setSelected([]);
    setParsing(false);
    setSaving(false);
    setListening(false);
  }

  function handleClose() { reset(); onClose(); }

  function toggleMic() {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      toast.error('Speech recognition not supported in this browser. Type your log instead.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      setTranscript((t) => t + (t ? ' ' : '') + e.results[0][0].transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }

  async function parse() {
    if (!transcript.trim()) return;
    setParsing(true);
    try {
      const res = await parseVoiceTranscript(transcript);
      const parsed = res.data?.entries ?? [];
      setEntries(parsed);
      setSelected(parsed.map((_, i) => i));
    } catch (err) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Failed to parse';
      if (msg.includes('not configured')) {
        toast.error('Voice parsing requires an Anthropic API key — add it to server/.env');
      } else {
        toast.error(msg);
      }
    } finally {
      setParsing(false);
    }
  }

  function toggleEntry(i) {
    setSelected((sel) => sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i]);
  }

  async function logSelected() {
    const toSave = (entries ?? []).filter((_, i) => selected.includes(i));
    if (!toSave.length) return;
    setSaving(true);
    let saved = 0;
    for (const entry of toSave) {
      try {
        await saveEntry(entry);
        saved++;
      } catch {
        toast.error(`Failed to save ${entry.category}`);
      }
    }
    setSaving(false);
    if (saved > 0) toast.success(`Logged ${saved} entr${saved === 1 ? 'y' : 'ies'}`);
    handleClose();
  }

  function summarize(entry) {
    const d = entry.data ?? {};
    switch (entry.category) {
      case 'weight':    return `${d.weight} ${d.unit ?? 'lbs'}`;
      case 'sleep':     return `${d.hours_slept}h${d.sleep_score != null ? `, score ${d.sleep_score}` : ''}`;
      case 'caffeine':  return `${d.mg}mg${d.source ? ` (${d.source})` : ''}`;
      case 'nutrition': return [d.calories && `${d.calories} kcal`, d.protein_g && `P ${d.protein_g}g`].filter(Boolean).join(' · ');
      case 'calories':  return d.active_calories ? `${d.active_calories} active kcal` : d.activity_type ?? '';
      case 'workout':   return [d.name, d.duration_min && `${d.duration_min} min`].filter(Boolean).join(' · ');
      default:          return JSON.stringify(d);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Voice Log" size="md">
      <div className="flex flex-col gap-4">
        {entries === null ? (
          <>
            <p className="text-text3 text-sm">
              Describe what you logged today — weight, sleep, workouts, caffeine, nutrition, or calorie burn.
            </p>

            <div className="relative">
              <Textarea
                placeholder='e.g. "Weighed 185 lbs, slept 7.5 hours, had 2 coffees and did a 45 min push day"'
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
              />
              <button
                type="button"
                onClick={toggleMic}
                className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                  listening
                    ? 'bg-danger/20 text-danger animate-pulse'
                    : 'bg-surface3 text-text3 hover:text-text1'
                }`}
                title={listening ? 'Stop recording' : 'Start recording'}
              >
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            <Button onClick={parse} disabled={!transcript.trim() || parsing} isLoading={parsing} className="w-full">
              {parsing ? 'Parsing…' : 'Parse Entry'}
            </Button>
          </>
        ) : (
          <>
            {entries.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-text2 text-sm mb-3">Couldn't extract any fitness data from that.</p>
                <Button variant="ghost" onClick={() => setEntries(null)}>Try again</Button>
              </div>
            ) : (
              <>
                <p className="text-text3 text-xs uppercase tracking-widest font-display">
                  {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} found — select to log
                </p>

                <div className="flex flex-col gap-2">
                  {entries.map((entry, i) => {
                    const meta = CATEGORY_META[entry.category] ?? { label: entry.category, Icon: Scale, color: 'text-text2' };
                    const checked = selected.includes(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleEntry(i)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          checked
                            ? 'bg-indigo/10 border-indigo/40'
                            : 'bg-abyss border-border hover:border-border2'
                        }`}
                      >
                        {checked ? (
                          <CheckSquare size={16} className="text-indigo-light shrink-0" />
                        ) : (
                          <Square size={16} className="text-text3 shrink-0" />
                        )}
                        <meta.Icon size={15} className={`${meta.color} shrink-0`} />
                        <div className="min-w-0">
                          <p className="text-xs text-text3 font-display uppercase tracking-wide">{meta.label}</p>
                          <p className="text-sm text-text1 font-medium truncate">{summarize(entry)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 mt-1">
                  <Button variant="ghost" onClick={() => setEntries(null)} className="flex-1">Back</Button>
                  <Button
                    onClick={logSelected}
                    disabled={selected.length === 0 || saving}
                    isLoading={saving}
                    className="flex-1"
                  >
                    Log {selected.length} entr{selected.length === 1 ? 'y' : 'ies'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

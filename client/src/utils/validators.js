import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const weightSchema = z.object({
  weight: z.coerce.number().positive('Weight must be positive').max(2000),
  unit: z.enum(['lbs', 'kg']),
  logged_at: z.string(),
  note: z.string().optional(),
});

export const nutritionSchema = z.object({
  logged_at: z.string(),
  calories: z.coerce.number().min(0).optional().nullable(),
  protein_g: z.coerce.number().min(0).optional().nullable(),
  carbs_g: z.coerce.number().min(0).optional().nullable(),
  fats_g: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional(),
});

export const sleepSchema = z.object({
  logged_at: z.string(),
  hours_slept: z.coerce.number().min(0).max(24),
  sleep_score: z.coerce.number().min(0).max(100).optional().nullable(),
  bed_time: z.string().optional(),
  wake_time: z.string().optional(),
  notes: z.string().optional(),
});

export const caffeineSchema = z.object({
  logged_at: z.string(),
  mg: z.coerce.number().positive().max(10000),
  source: z.string().optional(),
  logged_time: z.string().optional(),
  notes: z.string().optional(),
});

export const calorieBurnSchema = z.object({
  logged_at: z.string(),
  active_calories: z.coerce.number().min(0).optional().nullable(),
  passive_calories: z.coerce.number().min(0).optional().nullable(),
  activity_type: z.string().optional(),
  notes: z.string().optional(),
});

const setSchema = z.object({
  reps: z.coerce.number().int().min(0).optional().nullable(),
  weight: z.coerce.number().min(0).optional().nullable(),
  weight_unit: z.enum(['lbs', 'kg']).default('lbs'),
});

const exerciseSchema = z.object({
  exercise: z.string().min(1, 'Exercise name required'),
  sets: z.array(setSchema).min(1),
});

export const workoutSchema = z.object({
  name: z.string().optional(),
  logged_at: z.string(),
  duration_min: z.coerce.number().int().min(0).optional().nullable(),
  notes: z.string().optional(),
  exercises: z.array(exerciseSchema).default([]),
});

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Logo } from '../components/ui/Logo.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { registerSchema } from '../utils/validators.js';
import { useAuthStore } from '../store/authStore.js';
import { registerApi } from '../api/auth.api.js';

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    try {
      await registerApi(data.email, data.password, data.name);
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-abyss flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size={48} showWordmark />
        </div>

        <div className="bg-surface2 border border-border rounded-2xl p-7">
          <h1 className="font-display text-xl font-bold text-text1 mb-6">Create your account</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Name"
              type="text"
              placeholder="Your name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
              Create account
            </Button>
          </form>

          <p className="text-center text-text3 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-light hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

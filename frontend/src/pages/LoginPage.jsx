import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Button, Input, Card } from '../components/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    const result = await login(form);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`);
      navigate(result.user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [e.target.name]: '' }));
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-800">
            Welcome back
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            Sign in to your RBAC account
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              icon={Mail}
              placeholder="you@example.com"
              error={errors.email}
              autoComplete="email"
              autoFocus
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`input-field pl-10 pr-10 ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full mt-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </Card>

        {/* Admin hint */}
        <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
          <p className="text-xs text-emerald-700 text-center font-medium">
            🔐 Demo Admin — admin@rbac.dev / Admin@1234
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Button, Input, Card } from '../components/ui';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = 'Valid email is required';
    if (!form.password || form.password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    else if (!PASSWORD_RULES.every((r) => r.test(form.password)))
      errs.password = 'Password does not meet requirements';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    const result = await register(form);
    if (result.success) {
      setSuccess(true);
      toast.success('Account created! Awaiting admin approval.');
    } else {
      toast.error(result.message);
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [e.target.name]: '' }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 bg-mesh flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up text-center">
          <Card className="p-10">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-800">
              Registration Successful!
            </h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-xs mx-auto">
              Your account has been created. An admin will review and approve
              your request shortly.
            </p>
            <div className="mt-5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-sm text-amber-700 font-medium">
                ⏳ Status: <span className="font-bold">Pending Approval</span>
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-6"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-800">
            Create account
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            Request access — admin approval required
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              icon={User}
              placeholder="Jane Smith"
              error={errors.name}
              autoComplete="name"
              autoFocus
            />

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
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
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

              {/* Password strength indicators */}
              {form.password && (
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {PASSWORD_RULES.map((rule) => {
                    const passes = rule.test(form.password);
                    return (
                      <div
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          passes ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3 h-3 flex-shrink-0 ${
                            passes ? 'text-emerald-500' : 'text-slate-300'
                          }`}
                        />
                        {rule.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full mt-2"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-4">
          New accounts require admin approval before access is granted.
        </p>
      </div>
    </div>
  );
}

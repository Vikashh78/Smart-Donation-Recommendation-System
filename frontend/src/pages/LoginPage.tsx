import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import { Button, Input, Card } from '@/src/components/UI';
import { authService, handleApiError } from '@/src/services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      const { token, role, name, email: userEmail } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userName', name);
      localStorage.setItem('email', userEmail);

      navigate(`/${role}-dashboard`);
    } catch (err) {
      const message = handleApiError(err);
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">SmartDonation</span>
          </Link>
          <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-slate-500 mt-2">Enter your credentials to access your dashboard</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <button type="button" className="text-xs font-semibold text-blue-600 hover:underline">
                  Forgot password?
                </button>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full h-12" isLoading={isLoading}>
              Sign In
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

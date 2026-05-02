import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, CheckCircle2 } from 'lucide-react';
import { Button, Input, Card } from '@/src/components/UI';
import { authService, handleApiError } from '@/src/services/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor' as 'donor' | 'hospital',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await authService.register(formData);
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">SmartDonation</span>
          </Link>
          <h2 className="text-3xl font-bold text-slate-900">Join the movement</h2>
          <p className="text-slate-500 mt-2">Help us make medical resource distribution smarter.</p>
        </div>

        <Card className="p-8 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, x: -50 }}
                onSubmit={handleRegister}
                className="space-y-5"
              >
                <Input
                  label="Full Name / Hospital Name"
                  placeholder="John Doe or City Hospital"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">I am a...</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'donor' })}
                      className={`py-3 rounded-2xl text-sm font-semibold border-2 transition-all ${
                        formData.role === 'donor'
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      Donor
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'hospital' })}
                      className={`py-3 rounded-2xl text-sm font-semibold border-2 transition-all ${
                        formData.role === 'hospital'
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      Hospital
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 mt-4" isLoading={isLoading}>
                  Create Account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="py-12 text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h3>
                <p className="text-slate-500">
                  Please check your email to verify your account. Redirecting you to login...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}
        </Card>

        {!isSuccess && (
          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Log in instead
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}

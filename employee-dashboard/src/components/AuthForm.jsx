import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// adjust import path if your helper is elsewhere
import { apiFetch } from '../utils/api';

const AuthForm = ({ mode = 'login', onSuccess }) => {
  const isSignup = mode === 'signup';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/auth/${isSignup ? 'register' : 'login'}`;
      const { res, json } = await apiFetch(url, {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = json ?? (await res.json().catch(() => null));
      if (!result || !result.success) {
        setError(result?.message || 'Something went wrong');
        setLoading(false);
        return;
      }

      const token = result.token;
      const user = result.user;
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      setLoading(false);
      if (onSuccess) onSuccess(result);
      else navigate('/');
    } catch (err) {
      setError('Network error');
      setLoading(false);
      console.log(err);

    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{isSignup ? 'Create account' : 'Sign in'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <div>
            <label className="block text-sm text-slate-600 mb-1">Full name</label>
            <input
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="form-input w-full border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
        )}
        <div>
          <label className="block text-sm text-slate-600 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@company.com"
            className="form-input w-full border-slate-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={handleChange}
              placeholder={isSignup ? 'Create a password' : 'Enter your password'}
              className="form-input w-full border-slate-300 rounded-lg px-3 py-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && <div className="text-rose-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
        >
          {loading ? (isSignup ? 'Creating...' : 'Signing in...') : (isSignup ? 'Sign up' : 'Sign in')}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
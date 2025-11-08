import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// adjust import path if your helper is elsewhere
import { apiFetch } from '../utils/api';

const AuthForm = ({ mode = 'login', onSuccess }) => {
  const isSignup = mode === 'signup';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
          <input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder={isSignup ? 'Create a password' : 'Enter your password'}
            className="form-input w-full border-slate-300 rounded-lg px-3 py-2"
          />
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
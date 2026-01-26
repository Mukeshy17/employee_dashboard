import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { res, json } = await apiFetch(
        'http://localhost:5000/api/auth/request-password-reset',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const result = json ?? (await res.json().catch(() => null));

      if (!result || !result.success) {
        setError(result?.message || 'Something went wrong');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setEmail('');
      setLoading(false);
    } catch (err) {
      setError('Network error');
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
      <p className="text-slate-600 text-sm mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <p className="text-emerald-700 text-sm font-medium">
            Check your email for password reset instructions. The link will expire in 30 minutes.
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="form-input w-full border-slate-300 rounded-lg px-3 py-2 border"
          />
        </div>

        {error && <div className="text-rose-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-200 text-center">
        <p className="text-slate-600 text-sm">
          Remember your password?{' '}
          <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

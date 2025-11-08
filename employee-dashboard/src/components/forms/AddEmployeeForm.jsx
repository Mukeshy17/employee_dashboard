import React, { useState, useRef } from 'react';
import { apiFetch } from '../../utils/api';

const AddEmployeeForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    supervisor: '',
    availableForTask: true,
    useTransport: false,
    bandwidthStatus: 'available',
    currentProject: '',
    skillSet: [],
    workload: 20
  });

  const [skillInput, setSkillInput] = useState('');
  const skillRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill) => {
    const s = (skill || skillInput).trim();
    if (!s) return;
    if (!formData.skillSet.includes(s)) {
      setFormData(prev => ({ ...prev, skillSet: [...prev.skillSet, s] }));
    }
    setSkillInput('');
    skillRef.current?.focus();
  };

  const removeSkill = (idx) => {
    setFormData(prev => ({ ...prev, skillSet: prev.skillSet.filter((_, i) => i !== idx) }));
  };

  // changed: call backend API to add employee
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email) {
      setError('Name and email are required.');
      return;
    }

    setLoading(true);
    try {
      const url = 'http://localhost:5000/api/employees';
      const { res, json } = await apiFetch(url, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = json ?? (await res.json().catch(() => null));

      if (!result || !result.success) {
        setError(result?.message || 'Failed to add employee');
        setLoading(false);
        return;
      }

      // assume backend returns created employee in result.data or result.employee
      const created = result.data || result.employee || null;

      // reset form
      setFormData({
        name: '',
        email: '',
        contact: '',
        supervisor: '',
        availableForTask: true,
        useTransport: false,
        bandwidthStatus: 'available',
        currentProject: '',
        skillSet: [],
        workload: 20
      });

      setSkillInput('');
      setLoading(false);

      // notify parent to update list
      onSubmit && onSubmit(created || result);
    } catch (err) {
      console.error(err);
      setError('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 mb-4 to-slate-100 rounded-2xl p-6 shadow-xl border border-slate-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Add New Employee</h3>
          <p className="text-sm text-slate-500">Quickly add a team member and their details.</p>
        </div>
        <div className="text-sm text-slate-400">Step 1 of 1</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="e.g. Mukesh Sharma"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => handleChange('contact', e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supervisor</label>
            <input
              type="text"
              value={formData.supervisor}
              onChange={(e) => handleChange('supervisor', e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Supervisor name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Project</label>
            <input
              type="text"
              value={formData.currentProject}
              onChange={(e) => handleChange('currentProject', e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={formData.bandwidthStatus}
              onChange={(e) => handleChange('bandwidthStatus', e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="available">Available</option>
              <option value="partially-available">Partially Available</option>
              <option value="busy">Busy</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700">Workload: <span className="font-medium text-slate-900">{formData.workload}%</span></label>
            <div className="text-xs text-slate-500">0% - 100%</div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.workload}
            onChange={(e) => handleChange('workload', Number(e.target.value))}
            className="w-full h-2 accent-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Skills</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {formData.skillSet.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm shadow-sm">
                {s}
                <button type="button" onClick={() => removeSkill(i)} className="ml-1 text-slate-400 hover:text-rose-500">×</button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              ref={skillRef}
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Type skill and press Enter"
              className="flex-1 rounded-md border border-slate-200 px-3 py-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <button type="button" onClick={() => addSkill()} className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition">
              Add
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.availableForTask}
              onChange={(e) => handleChange('availableForTask', e.target.checked)}
              className="h-4 w-4 text-emerald-600 rounded"
            />
            <span className="text-sm text-slate-700">Available for Tasks</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.useTransport}
              onChange={(e) => handleChange('useTransport', e.target.checked)}
              className="h-4 w-4 text-emerald-600 rounded"
            />
            <span className="text-sm text-slate-700">Uses Transport</span>
          </label>
        </div>

        {error && <div className="text-sm text-rose-600">{error}</div>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60">
            {loading ? 'Adding...' : 'Add Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeForm;
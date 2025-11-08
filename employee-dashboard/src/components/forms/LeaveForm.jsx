import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import LeaveApproval from '../LeaveApproval';

const LeaveForm = ({ employees = [], editingApplication, onSubmit, onCancel, currentUser = {}, isAdmin = false }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeEmail: '',
    supervisor: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingApplication) {
      setFormData({
        employeeName: editingApplication.employeeName || '',
        employeeEmail: editingApplication.employeeEmail || '',
        supervisor: editingApplication.supervisor || '',
        startDate: editingApplication.startDate || '',
        endDate: editingApplication.endDate || '',
        reason: editingApplication.reason || ''
      });
    }
  }, [editingApplication]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeName || !formData.startDate || !formData.endDate) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = 'http://localhost:5000/api/leaves';
      const { res, json } = await apiFetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        body: JSON.stringify({
          employee_name: formData.employeeName,
          employee_email: formData.employeeEmail,
          supervisor: formData.supervisor,
          start_date: formData.startDate,
          end_date: formData.endDate,
          reason: formData.reason,
          status: 'pending',
          applied_date: new Date().toISOString().split('T')[0] // Add today's date in YYYY-MM-DD format
        })
      });

      const result = json ?? (await res.json().catch(() => null));

      if (!result?.success) {
        throw new Error(result?.message || 'Failed to submit leave application');
      }

      // Reset form
      if (!isEditMode) {
        setFormData({
          employeeName: '',
          employeeEmail: '',
          supervisor: '',
          startDate: '',
          endDate: '',
          reason: ''
        });
      }

      // Notify parent component
      onSubmit && onSubmit(result.data);
    } catch (err) {
      console.error('Leave application error:', err);
      setError(err.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (employeeName) => {
    const selectedEmployee = employees.find(emp => emp.name === employeeName);
    setFormData(prev => ({
      ...prev,
      employeeName,
      employeeEmail: selectedEmployee ? selectedEmployee.email : '',
      supervisor: selectedEmployee ? selectedEmployee.supervisor || '' : ''
    }));
  };

  const isEditMode = !!editingApplication;
  const canEdit = !isEditMode || (isAdmin || editingApplication?.employeeEmail === currentUser.email);

  const minStart = new Date().toISOString().split('T')[0];
  const minEnd = formData.startDate || minStart;

  return (
    <div className="bg-gradient-to-br from-white mb-4 via-slate-50 to-slate-100 rounded-2xl p-6 shadow-xl border border-slate-200">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{isEditMode ? 'Edit Leave Application' : 'Apply for Leave'}</h3>
            <p className="text-sm text-slate-500">Submit leave request — supervisors will be notified.</p>
          </div>
        </div>
        <div className="text-sm text-slate-400">{isEditMode ? 'Editing' : 'New'}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employee *</label>
            <select
              value={formData.employeeName}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              required
              disabled={!canEdit}
            >
              <option value="">{currentUser?.name ? `Select — ${currentUser.name}` : 'Select Employee'}</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name} {emp.email ? `• ${emp.email}` : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supervisor</label>
            <input
              type="text"
              value={formData.supervisor}
              readOnly
              className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 text-slate-600"
              placeholder="Supervisor will auto-fill"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              min={minStart}
              required
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date *</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              min={minEnd}
              required
              disabled={!canEdit}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full rounded-md border border-slate-200 px-3 py-3 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="E.g. PL / SL / Emergency — give brief details"
              rows={4}
              disabled={!canEdit}
            />
            <p className="text-xs text-slate-400 mt-2">Tip: include dates and contact info so your supervisor can approve quickly.</p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            <span className="font-medium">Applicant:</span> {currentUser?.name || '—'} 
            <span className="text-slate-400">•</span> 
            <span>{currentUser?.email || ''}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition disabled:opacity-50"
            >
              Cancel
            </button>

            {canEdit ? (
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loading 
                  ? (isEditMode ? 'Saving...' : 'Submitting...') 
                  : (isEditMode ? 'Save Changes' : 'Submit Application')
                }
              </button>
            ) : (
              <div className="text-sm text-rose-600">You cannot edit this application</div>
            )}
          </div>
        </div>
      </form>

      {/* Add approval section if editing and user is supervisor */}
      {editingApplication && (
        <LeaveApproval
          leave={editingApplication}
          currentUser={currentUser}
          onStatusUpdate={(updatedLeave) => {
            onSubmit && onSubmit(updatedLeave);
          }}
        />
      )}
    </div>
  );
};

export default LeaveForm;
import React, { useState } from 'react';
import { apiFetch } from '../utils/apiFetch';

const LeaveApproval = ({ leave,currentUser, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    setError('');

    try {
      const { json } = await apiFetch(`http://localhost:5000/api/leaves/${leave.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          updated_by: leave.supervisor // Track who approved/rejected
        })
      });

      if (!json?.success) {
        throw new Error(json?.message || 'Failed to update leave status');
      }

      onStatusUpdate && onStatusUpdate(json.data);
    } catch (err) {
      console.error('Leave approval error:', err);
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-slate-700">Leave Status: 
            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                leave.status === 'approved' ? 'bg-green-100 text-green-800' : 
                'bg-red-100 text-red-800'}`}>
              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
            </span>
          </h4>
          {error && <p className="text-sm text-rose-600 mt-1">{error}</p>}
        </div>

        {leave.status === 'pending' && leave.supervisor === currentUser?.email && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStatusUpdate('approved')}
              disabled={loading}
              className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'Approving...' : 'Approve'}
            </button>
            <button
              onClick={() => handleStatusUpdate('rejected')}
              disabled={loading}
              className="px-3 py-1.5 rounded-md bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
            >
              {loading ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApproval;
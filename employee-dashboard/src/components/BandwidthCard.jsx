import React from 'react';

function getStatusColor(status) {
  switch (status) {
    case 'available':
      return 'bg-emerald-100 text-emerald-700';
    case 'busy':
      return 'bg-rose-100 text-rose-700';
    case 'partially-available':
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
}

function getWorkloadColor(workload) {
  if (workload < 40) return 'bg-emerald-400';
  if (workload < 70) return 'bg-yellow-400';
  return 'bg-rose-400';
}

const BandwidthCard = ({
  employee,
  isAdmin,
  isEditing,
  editingBandwidth,
  setEditingBandwidth,
  onUpdateBandwidth,
  onStartEditing,
}) => {
  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{employee.name}</h3>
          <p className="text-sm text-slate-500">{employee.email}</p>
          <p className="text-sm text-slate-500">Supervisor: {employee.supervisor}</p>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(employee.bandwidthStatus)}`}>
          {employee.bandwidthStatus === 'available'
            ? 'Available'
            : employee.bandwidthStatus === 'busy'
            ? 'Busy'
            : 'Partial'}
        </div>
      </div>

      {employee.currentProject && (
        <div className="mb-3">
          <p className="text-sm font-medium text-slate-700">Current Project</p>
          <p className="text-sm text-slate-500">{employee.currentProject}</p>
        </div>
      )}

      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-slate-700">Workload</p>
          <p className="text-sm text-slate-500">{employee.workload}%</p>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className={`${getWorkloadColor(employee.workload)} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${employee.workload}%` }}
          />
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-slate-700 mb-2">Skills</p>
        <div className="flex flex-wrap gap-2">
          {employee.skillSet.map((s, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-slate-200 rounded shadow-sm font-medium text-slate-700">
              {s}
            </span>
          ))}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div>
            <label className="text-sm text-slate-600 block mb-1">Status</label>
            <select
              value={editingBandwidth.status}
              onChange={(e) => setEditingBandwidth({ ...editingBandwidth, status: e.target.value })}
              className="form-select w-full border-slate-300 rounded-lg"
            >
              <option value="available">Available</option>
              <option value="partially-available">Partially Available</option>
              <option value="busy">Busy</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600 block mb-1">Project</label>
            <input
              type="text"
              value={editingBandwidth.project}
              onChange={(e) => setEditingBandwidth({ ...editingBandwidth, project: e.target.value })}
              className="form-input w-full border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 block mb-1">Workload (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={editingBandwidth.workload}
              onChange={(e) =>
                setEditingBandwidth({ ...editingBandwidth, workload: parseInt(e.target.value) || 0 })
              }
              className="form-input w-full border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                onUpdateBandwidth(
                  editingBandwidth.id,
                  editingBandwidth.status,
                  editingBandwidth.project,
                  editingBandwidth.workload
                )
              }
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 font-semibold transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditingBandwidth(null)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-lg py-2 font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => onStartEditing(employee)}
            disabled={!isAdmin}
            className={`w-full rounded-lg py-2 font-semibold transition ${
              isAdmin
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Update Bandwidth
          </button>
        </div>
      )}
    </div>
  );
};

export default BandwidthCard;
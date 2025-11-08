import React, { useState, useEffect } from 'react'

const LeaveForm = ({ employees, editingApplication, onSubmit, onCancel, currentUser, isAdmin }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeEmail: '',
    supervisor: '',
    startDate: '',
    endDate: '',
    reason: ''
  })

  useEffect(() => {
    if (editingApplication) {
      setFormData({
        employeeName: editingApplication.employeeName,
        employeeEmail: editingApplication.employeeEmail,
        supervisor: editingApplication.supervisor,
        startDate: editingApplication.startDate,
        endDate: editingApplication.endDate,
        reason: editingApplication.reason
      })
    }
  }, [editingApplication])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.employeeName && formData.startDate && formData.endDate) {
      onSubmit(formData)
    }
  }

  const handleEmployeeChange = (employeeName) => {
    const selectedEmployee = employees.find(emp => emp.name === employeeName)
    setFormData(prev => ({
      ...prev,
      employeeName,
      employeeEmail: selectedEmployee ? selectedEmployee.email : '',
      supervisor: selectedEmployee ? selectedEmployee.supervisor : ''
    }))
  }

  const isEditMode = !!editingApplication
  const canEdit = !isEditMode || (isAdmin || editingApplication?.employeeEmail === currentUser.email)

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {isEditMode ? 'Edit Leave Application' : 'Apply for Leave'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Employee Name *</label>
            <select
              value={formData.employeeName}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              className="form-select"
              required
              disabled={!canEdit}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Start Date *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
              required
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="form-label">End Date *</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="form-input"
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              required
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="form-label">Reason</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="form-input"
              placeholder="Enter reason (PL/UPL/SL/emergency)"
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          {canEdit && (
            <button
              type="submit"
              className="btn btn-success"
            >
              {isEditMode ? 'Save Changes' : 'Submit Application'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default LeaveForm
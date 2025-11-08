import React, { useState } from 'react'
import { Plus, Check, X } from 'lucide-react'
import LeaveForm from '../forms/LeaveForm'

const LeavesTab = ({ leaveApplications, setLeaveApplications, employees, currentUser, isAdmin }) => {
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [editingLeaveId, setEditingLeaveId] = useState(null)

  const handleLeaveAction = (id, action) => {
    if (!isAdmin) return
    setLeaveApplications(prev =>
      prev.map(app =>
        app.id === id ? { ...app, status: action } : app
      )
    )
  }

  const handleAddLeaveApplication = (formData) => {
    const employee = employees.find(emp => emp.name === formData.employeeName)

    const newApplication = {
      id: Date.now(),
      employeeName: formData.employeeName,
      employeeEmail: employee ? employee.email : formData.employeeEmail,
      supervisor: employee ? employee.supervisor : formData.supervisor,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason || 'PL',
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0]
    }

    setLeaveApplications(prev => [...prev, newApplication])
    setShowLeaveForm(false)
  }

  const handleUpdateLeaveApplication = (formData) => {
    if (!editingLeaveId) return
    
    setLeaveApplications(prev => prev.map(app => 
      app.id === editingLeaveId ? {
        ...app,
        employeeName: formData.employeeName,
        employeeEmail: formData.employeeEmail,
        supervisor: formData.supervisor,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      } : app
    ))

    setEditingLeaveId(null)
    setShowLeaveForm(false)
  }

  const handleStartEditLeave = (application) => {
    if (!isAdmin && application.employeeEmail !== currentUser.email) return
    setEditingLeaveId(application.id)
    setShowLeaveForm(true)
  }

  const getEditingApplication = () => {
    return editingLeaveId ? leaveApplications.find(app => app.id === editingLeaveId) : null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Leave Applications</h2>
        <button
          onClick={() => { 
            setShowLeaveForm(true)
            setEditingLeaveId(null)
          }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Apply for Leave
        </button>
      </div>

      {showLeaveForm && (
        <LeaveForm
          employees={employees}
          editingApplication={getEditingApplication()}
          onSubmit={editingLeaveId ? handleUpdateLeaveApplication : handleAddLeaveApplication}
          onCancel={() => { 
            setShowLeaveForm(false)
            setEditingLeaveId(null)
          }}
          currentUser={currentUser}
          isAdmin={isAdmin}
        />
      )}

      <div className="space-y-4">
        {leaveApplications.map((application) => (
          <div key={application.id} className="bg-white shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {application.employeeName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{application.employeeEmail}</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Supervisor: {application.supervisor}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Dates:</span>
                      <p className="text-gray-600">{application.startDate} to {application.endDate}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Reason:</span>
                      <p className="text-gray-600">{application.reason}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Applied:</span>
                      <p className="text-gray-600">{application.appliedDate}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`inline-block mt-1 badge ${
                        application.status === 'pending' ? 'badge-yellow' : 
                        application.status === 'approved' ? 'badge-green' : 'badge-red'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {/* Approve / Reject - only admin */}
                  {isAdmin && application.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleLeaveAction(application.id, 'approved')} 
                        className="btn btn-success btn-small" 
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleLeaveAction(application.id, 'rejected')} 
                        className="btn btn-secondary btn-small" 
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Edit - allowed for admin or the owner of the leave (when pending) */}
                  {((isAdmin) || (application.employeeEmail === currentUser.email)) && 
                   application.status === 'pending' && (
                    <button 
                      onClick={() => handleStartEditLeave(application)} 
                      className="btn btn-primary btn-small"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LeavesTab
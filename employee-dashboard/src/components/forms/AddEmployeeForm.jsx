import React, { useState } from 'react'

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
    workload: 0
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.email) {
      onSubmit(formData)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Employee</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="form-input"
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div>
            <label className="form-label">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="form-input"
              placeholder="Enter email address"
              required
            />
          </div>
          
          <div>
            <label className="form-label">Contact Number</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => handleChange('contact', e.target.value)}
              className="form-input"
              placeholder="Enter contact number"
            />
          </div>
          
          <div>
            <label className="form-label">Supervisor Name</label>
            <input
              type="text"
              value={formData.supervisor}
              onChange={(e) => handleChange('supervisor', e.target.value)}
              className="form-input"
              placeholder="Enter supervisor name"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.availableForTask}
              onChange={(e) => handleChange('availableForTask', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Available for Tasks</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.useTransport}
              onChange={(e) => handleChange('useTransport', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Uses Transport</span>
          </label>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-success"
          >
            Add Employee
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddEmployeeForm
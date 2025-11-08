import React, { useState } from 'react'
import BandwidthCard from '../BandwidthCard'

const BandwidthTab = ({ employees, setEmployees, fullyAvailable, busyEmployees, isAdmin }) => {
  const [editingBandwidth, setEditingBandwidth] = useState(null)

  const updateBandwidthStatus = (id, newStatus, project = '', workload = 0) => {
    if (!isAdmin) return
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === id ? {
          ...emp,
          bandwidthStatus: newStatus,
          currentProject: project,
          workload: workload,
          availableForTask: newStatus === 'available'
        } : emp
      )
    )
    setEditingBandwidth(null)
  }

  const startEditingBandwidth = (employee) => {
    if (!isAdmin) return
    setEditingBandwidth({
      id: employee.id,
      status: employee.bandwidthStatus,
      project: employee.currentProject,
      workload: employee.workload
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bandwidth Availability Management</h2>
        <div className="flex space-x-4">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Available: {fullyAvailable}
          </div>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            Busy: {busyEmployees}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <BandwidthCard
            key={employee.id}
            employee={employee}
            editingBandwidth={editingBandwidth}
            setEditingBandwidth={setEditingBandwidth}
            onUpdateBandwidth={updateBandwidthStatus}
            onStartEditing={startEditingBandwidth}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  )
}

export default BandwidthTab
import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import AddEmployeeForm from '../forms/AddEmployeeForm'

const user = JSON.parse(localStorage.getItem("user"));
const EmployeesTab = ({ employees, setEmployees }) => {
  const [showAddEmployee, setShowAddEmployee] = useState(false)

  const toggleAvailability = (id) => {
    if (!user?.is_admin) return
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === id ? { ...emp, availableForTask: !emp.availableForTask } : emp
      )
    )
  }

  const handleAddEmployee = (newEmployeeData) => {
    setEmployees(prev => [
      ...prev,
      { ...newEmployeeData, id: Date.now() }
    ])
    setShowAddEmployee(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Employee Information</h2>
        <button
          onClick={() => setShowAddEmployee(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-emerald-700 transition-colors disabled:opacity-50"
          disabled={!user?.is_admin}
          title={!user?.is_admin ? 'Only admin can add employees' : 'Add Employee'}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </div>

      {showAddEmployee && user?.is_admin && (
        <AddEmployeeForm
          onSubmit={handleAddEmployee}
          onCancel={() => setShowAddEmployee(false)}
        />
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supervisor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transport
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{employee.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{employee.contact}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{employee.supervisor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAvailability(employee.id)}
                      className={`badge cursor-pointer transition-colors ${
                        employee.availableForTask ? 'badge-green' : 'badge-red'
                      } ${!user?.is_admin ? 'cursor-not-allowed opacity-50' : ''}`}
                      disabled={!user?.is_admin}
                      title={!user?.is_admin ? 'Only admin can change status' : ''}
                    >
                      {employee.availableForTask ? 'Available' : 'Busy'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${employee.useTransport ? 'badge-blue' : 'badge-gray'}`}>
                      {employee.useTransport ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EmployeesTab


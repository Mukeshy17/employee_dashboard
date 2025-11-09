import React, { useState, useMemo } from 'react'
import { Plus, Mail, Phone, User, Truck, CheckCircle, XCircle } from 'lucide-react'
import AddEmployeeForm from '../forms/AddEmployeeForm'

const user = JSON.parse(localStorage.getItem("user"));
const EmployeesTab = ({ employees, setEmployees }) => {
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [query, setQuery] = useState('')

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

  const filteredEmployees = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return employees
    return employees.filter(e =>
      (e.name || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.contact || '').toLowerCase().includes(q) ||
      (e.supervisor || '').toLowerCase().includes(q)
    )
  }, [employees, query])

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Information</h2>
          <p className="text-sm text-gray-500 mt-1">Overview of your workforce — search, filter and manage availability.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none w-full">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Search by name, email, contact or supervisor..."
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
            </span>
          </div>

          <button
            onClick={() => setShowAddEmployee(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
            disabled={!user?.is_admin}
            title={!user?.is_admin ? 'Only admin can add employees' : 'Add Employee'}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {showAddEmployee && user?.is_admin && (
        <AddEmployeeForm
          onSubmit={handleAddEmployee}
          onCancel={() => setShowAddEmployee(false)}
        />
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                          {employee.name ? employee.name.split(' ').map(n=>n[0]).slice(0,2).join('') : '?'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" /> {employee.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{employee.contact || '-'}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap sm:hidden">
                    <div className="text-sm text-gray-700">{employee.contact || '-'}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{employee.supervisor || '-'}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAvailability(employee.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none ${
                        employee.availableForTask ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      } ${!user?.is_admin ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-95'}`}
                      disabled={!user?.is_admin}
                      title={!user?.is_admin ? 'Only admin can change status' : ''}
                    >
                      {employee.availableForTask ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {employee.availableForTask ? 'Available' : 'Busy'}
                    </button>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      employee.useTransport ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Truck className="w-4 h-4" />
                      {employee.useTransport ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EmployeesTab


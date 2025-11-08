import React from 'react'
import { Bus } from 'lucide-react'

const TransportTab = ({ employees, transportUsers }) => {
  const transportUtilization = Math.round((transportUsers / employees.length) * 100)
  const transportEmployees = employees.filter(emp => emp.useTransport)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Transport Usage</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transport Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
            <Bus className="w-5 h-5 mr-2" />
            Transport Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700 font-medium">Total employees:</span>
              <span className="text-blue-900 font-semibold">{employees.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700 font-medium">Transport utilization:</span>
              <span className="text-blue-900 font-semibold">{transportUtilization}%</span>
            </div>
          </div>
        </div>

        {/* Transport Users */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-900 mb-4">
            Transport Users
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {transportEmployees.length === 0 ? (
              <p className="text-green-700 text-sm">No employees using transport</p>
            ) : (
              transportEmployees.map(emp => (
                <div key={emp.id} className="flex items-center text-green-700">
                  <Bus className="w-4 h-4 mr-2 text-green-600" />
                  <span className="font-medium">{emp.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detailed Transport List */}
      {transportEmployees.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transport User Details</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {transportEmployees.map((employee) => (
                <li key={employee.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bus className="w-5 h-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {employee.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        Supervisor: {employee.supervisor}
                      </p>
                      <p className="text-sm text-gray-500">
                        Contact: {employee.contact}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransportTab
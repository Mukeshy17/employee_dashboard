import React from 'react'

const DevicesTab = ({ devices }) => {
  const deviceStats = [
    {
      type: 'iPhone',
      count: devices.filter(d => d.type === 'iPhone').length,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      type: 'iPad',
      count: devices.filter(d => d.type === 'iPad').length,
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      type: 'MacBook',
      count: devices.filter(d => d.type === 'MacBook').length,
      color: 'bg-gray-100 text-gray-800'
    }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Device Inventory</h2>
      
      {/* Device Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {deviceStats.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-center">
                <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stat.color} mb-2`}>
                  {stat.type}s
                </p>
                <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Device Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {device.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{device.model}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {device.assignedTo || 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${
                      device.status === 'In Use' ? 'badge-green' : 'badge-yellow'
                    }`}>
                      {device.status}
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

export default DevicesTab
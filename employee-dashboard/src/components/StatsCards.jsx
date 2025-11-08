import React from 'react'
import { Users, CheckCircle, Bus, Calendar } from 'lucide-react'


const StatsCards = ({ stats }) => {
const { totalEmployees, availableEmployees, transportUsers, pendingLeaves, onLeaveToday } = stats


const items = [
{ Icon: Users, title: 'Total Employees', value: totalEmployees, accent: 'from-blue-50 to-blue-100' },
{ Icon: CheckCircle, title: 'Available', value: availableEmployees, accent: 'from-emerald-50 to-emerald-100' },
{ Icon: Bus, title: 'Transport', value: transportUsers, accent: 'from-purple-50 to-purple-100' },
{ Icon: Calendar, title: 'Pending Leaves', value: pendingLeaves, accent: 'from-amber-50 to-amber-100' }
]


return (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
{items.map((it, idx) => (
<div key={idx} className="bg-white/60 backdrop-blur rounded-2xl p-5 shadow-xl border border-white/20">
<div className="flex items-center justify-between">
<div className={`p-3 rounded-xl bg-gradient-to-br ${it.accent} shadow-inner`}>
<it.Icon className="w-6 h-6 text-slate-700" />
</div>
<div className="text-right">
<p className="text-sm text-slate-500">{it.title}</p>
<p className="text-2xl font-bold text-slate-900">{it.value}</p>
</div>
</div>
</div>
))}


<div className="bg-white/60 backdrop-blur rounded-2xl p-5 shadow-xl border border-white/20">
<div className="flex items-start gap-4">
<div className="p-3 rounded-xl bg-red-50">
<Calendar className="w-6 h-6 text-red-600" />
</div>
<div className="flex-1">
<p className="text-sm text-slate-500">On Leave (Today)</p>
<p className="text-2xl font-bold text-slate-900 mb-2">{onLeaveToday.length}</p>
<div className="space-y-1 text-xs text-slate-600">
{onLeaveToday.length === 0 ? (
<div className="text-xs text-slate-400">No one is on leave today</div>
) : (
onLeaveToday.map(app => (
<div key={app.id} className="truncate">
<div className="font-medium text-slate-700 truncate">{app.employeeName}</div>
<div className="truncate">{app.startDate} to {app.endDate} • {app.reason}</div>
</div>
))
)}
</div>
</div>
</div>
</div>


</div>
)
}


export default StatsCards
import React, { useState } from 'react'
import { Users, Calendar, CheckCircle, Bus, Smartphone } from 'lucide-react'
import Navigation from "../components/Navigation";
import Header from "../components/Header";
import StatsCards from "../components/StatsCards";
import EmployeesTab from "../components/tabs/EmployeesTab";
import LeavesTab from "../components/tabs/LeavesTab";
import BandwidthTab from "../components/tabs/BandwidthTab";
import TransportTab from "../components/tabs/TransportTab";
import DevicesTab from "../components/tabs/DevicesTab";
import {useEmployeeData} from '../hooks/useEmployeeData';
import TimeSheetCard from "../components/TimeSheetCard";


const Dashboard = () => {
  
  const {
    employees,
    setEmployees,
    leaveApplications,
    setLeaveApplications,
    devices,
    currentUser,
    setCurrentUser,
    allUsers,
    isAdmin,
    availableEmployees,
    transportUsers,
    pendingLeaves,
    devicesInUse,
    fullyAvailable,
    busyEmployees,
    onLeaveToday,
    dailyworks,
    setDailyWorks,
  } = useEmployeeData()

  const [activeTab, setActiveTab] = useState('employees')
  

const addTimeSheetRecord = (record) => {
  setDailyWorks((prev) => [...prev, record]);
};



  const tabs = [
    { id: 'employees', name: 'Employees', icon: Users },
    { id: 'leaves', name: 'Leave Applications', icon: Calendar },
    { id: 'bandwidth', name: 'Bandwidth Availability', icon: CheckCircle },
    { id: 'transport', name: 'Transport', icon: Bus },
    { id: 'devices', name: 'Devices', icon: Smartphone },
    { id: 'timesheet', name: 'Timesheet', icon: Calendar }
  ]

  const stats = {
    totalEmployees: employees.length,
    availableEmployees,
    transportUsers,
    pendingLeaves,
    devicesInUse,
    fullyAvailable,
    busyEmployees,
    onLeaveToday,
    dailyworks,
    
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'employees':
        return (
          <EmployeesTab
            employees={employees}
            setEmployees={setEmployees}
            isAdmin={isAdmin}
          />
        )
        case 'timesheet':
        return (
          <TimeSheetCard
            dailyworks={dailyworks}
            onAddRecord={addTimeSheetRecord}

          />
        ) 
      case 'leaves':
        return (
          <LeavesTab
            leaveApplications={leaveApplications}
            setLeaveApplications={setLeaveApplications}
            employees={employees}
            currentUser={currentUser}
            isAdmin={isAdmin}
          />
        )
      case 'bandwidth':
        return (
          <BandwidthTab
            employees={employees}
            setEmployees={setEmployees}
            fullyAvailable={fullyAvailable}
            busyEmployees={busyEmployees}
            isAdmin={isAdmin}
          />
        )
      case 'transport':
        return (
          <TransportTab
            employees={employees}
            transportUsers={transportUsers}
          />
        )
      case 'devices':
        return <DevicesTab devices={devices} />
      default:
        return null
    }
  }
  


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        <Header
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          allUsers={allUsers}
          isAdmin={isAdmin}
        />
        
        <StatsCards stats={stats} />
        
        <Navigation
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
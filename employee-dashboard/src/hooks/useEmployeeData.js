import { useState, useEffect } from "react";

export const useEmployeeData = () => {
  const [currentUser, setCurrentUser] = useState({
    name: "John Smith",
    email: "john.smith@company.com",
    isAdmin: false,
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [leaveApplications, setLeaveApplications] = useState([
    {
      id: 1,
      employeeName: "John Smith",
      employeeEmail: "john.smith@company.com",
      supervisor: "Sarah Johnson",
      startDate: "2024-10-15",
      endDate: "2024-10-17",
      reason: "PL",
      status: "approved",
      appliedDate: "2024-09-25",
    },
    {
      id: 2,
      employeeName: "Emily Davis",
      employeeEmail: "emily.davis@company.com",
      supervisor: "Michael Brown",
      startDate: "2024-10-22",
      endDate: "2024-10-22",
      reason: "SL",
      status: "pending",
      appliedDate: "2024-09-26",
    },
  ]);

  const [devices] = useState([
    { id: 1, type: "iPhone", model: "iPhone 15 Pro", assignedTo: "John Smith", status: "In Use" },
    { id: 2, type: "iPad", model: "iPad Air", assignedTo: "Emily Davis", status: "In Use" },
    { id: 3, type: "MacBook", model: "MacBook Pro 14\"", assignedTo: "Alex Chen", status: "In Use" },
    { id: 4, type: "iPhone", model: "iPhone 14", assignedTo: "", status: "Available" },
    { id: 5, type: "iPad", model: "iPad Pro", assignedTo: "", status: "Available" },
  ]);

  // ✅ Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch("http://localhost:5000/api/employees", {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        if (response.status === 401) {
          setError("Unauthorized — please login");
          setLoading(false);
          return;
        }

        const result = await response.json();
        if (result && result.success) {
          setEmployees(result.data);
        } else {
          setError(result?.message || "Failed to load employees");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const allUsers = employees.map((e) => ({ name: e.name, email: e.email }));
  const isAdmin = currentUser.isAdmin;

  // Helper: check if a leave includes the given date
  const isLeaveActiveOn = (application, date) => {
    const start = new Date(application.startDate);
    const end = new Date(application.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  };

  // Stats calculations
  const availableEmployees = employees.filter((emp) => emp.availableForTask).length;
  const transportUsers = employees.filter((emp) => emp.useTransport).length;
  const pendingLeaves = leaveApplications.filter((app) => app.status === "pending").length;
  const devicesInUse = devices.filter((device) => device.status === "In Use").length;
  const fullyAvailable = employees.filter((emp) => emp.bandwidthStatus === "available").length;
  const busyEmployees = employees.filter((emp) => emp.bandwidthStatus === "busy").length;

  const today = new Date();
  const onLeaveToday = leaveApplications.filter(
    (app) => app.status === "approved" && isLeaveActiveOn(app, today)
  );

  return {
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
    loading,
    error,
  };
};

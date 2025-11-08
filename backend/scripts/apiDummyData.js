import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

// Helper function to make API calls
const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // If no JSON body (204), return an ok marker
    if (response.status === 204) {
      return { ok: true, status: 204, body: null };
    }

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      // If API returns structured error
      const message = result?.message || result?.error || `HTTP ${response.status}`;
      console.error(`❌ API Error (${response.status}) on ${endpoint}:`, message);
      return null;
    }

    return result;
  } catch (error) {
    console.error(`❌ Network Error while calling ${endpoint}:`, error.message);
    return null;
  }
};

// Tries multiple post endpoints and returns the first successful response
const tryPostToEndpoints = async (endpoints, data, token) => {
  for (const ep of endpoints) {
    const res = await apiCall(ep, 'POST', data, token);
    // Accept either wrapped response ({ success: true, data: ... }) or raw created object (with id)
    if (res) {
      if (res.success && res.data) return { endpoint: ep, response: res };
      if (res.id || res._id) return { endpoint: ep, response: res };
      // Some APIs return { ok: true, body: null } for 204 — treat that as success
      if (res.ok && res.status === 204) return { endpoint: ep, response: res };
    }
    // small delay between tries
    await new Promise(r => setTimeout(r, 100));
  }
  return null;
};

const getAllEmployees = async (token = null) => {
  const res = await apiCall('/employees', 'GET', null, token);
  if (!res) return [];
  if (res.success && Array.isArray(res.data)) return res.data;
  if (Array.isArray(res)) return res;
  // if resource wrapped differently
  if (res.employees && Array.isArray(res.employees)) return res.employees;
  return [];
};

const addDummyDataViaAPI = async () => {
  console.log('🚀 Starting API-based dummy data insertion...');

  try {
    // Step 1: Login as admin to get token
    console.log('🔐 Logging in as admin...');
    const loginResult = await apiCall('/auth/login', 'POST', {
      email: 'admin@company.com',
      password: 'password123'
    });

    if (!loginResult) {
      console.error('❌ Failed to call login endpoint. Make sure /auth/login exists.');
      // continue without token — some APIs might not require auth for seeding
    }

    // normalize token extraction from different shapes
    let adminToken = null;
    if (loginResult) {
      if (loginResult.success && loginResult.data && loginResult.data.token) adminToken = loginResult.data.token;
      else if (loginResult.token) adminToken = loginResult.token;
      else if (loginResult.data && typeof loginResult.data === 'string') adminToken = loginResult.data; // edge-case
    }

    if (!adminToken) {
      console.log('⚠️ No admin token retrieved — proceeding without token (if your API requires auth this will fail).');
    } else {
      console.log('✅ Admin login successful');
    }

    // Step 2: Add employees
    console.log('👥 Adding employees...');
    const employees = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        contact: '+1 (555) 987-6543',
        supervisor: 'Michael Brown',
        availableForTask: true,
        useTransport: true,
        bandwidthStatus: 'available',
        currentProject: 'Web Development',
        workload: 45,
        skillSet: ['Project Management', 'Agile', 'Scrum']
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@company.com',
        contact: '+1 (555) 876-5432',
        supervisor: 'Sarah Johnson',
        availableForTask: true,
        useTransport: false,
        bandwidthStatus: 'partially-available',
        currentProject: 'Mobile App Testing',
        workload: 65,
        skillSet: ['Team Leadership', 'Quality Assurance', 'Testing']
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        contact: '+1 (555) 765-4321',
        supervisor: 'Sarah Johnson',
        availableForTask: false,
        useTransport: true,
        bandwidthStatus: 'busy',
        currentProject: 'Database Migration',
        workload: 90,
        skillSet: ['SQL', 'Database Design', 'MongoDB']
      },
      {
        name: 'Lisa Garcia',
        email: 'lisa.garcia@company.com',
        contact: '+1 (555) 654-3210',
        supervisor: 'Michael Brown',
        availableForTask: true,
        useTransport: true,
        bandwidthStatus: 'available',
        currentProject: '',
        workload: 30,
        skillSet: ['HTML', 'CSS', 'JavaScript', 'Vue.js']
      },
      {
        name: 'Robert Martinez',
        email: 'robert.martinez@company.com',
        contact: '+1 (555) 543-2109',
        supervisor: 'Sarah Johnson',
        availableForTask: true,
        useTransport: false,
        bandwidthStatus: 'partially-available',
        currentProject: 'API Development',
        workload: 70,
        skillSet: ['REST API', 'GraphQL', 'Microservices']
      }
    ];

    const createdEmployees = [];
    for (const employee of employees) {
      // try common employee endpoints
      const created = await tryPostToEndpoints(['/employees', '/employees/create', '/users', '/users/create'], employee, adminToken);
      if (created && created.response) {
        // normalize response object to actual employee object
        const body = created.response.success && created.response.data ? created.response.data : created.response;
        createdEmployees.push(body);
        console.log(`✅ Employee added: ${employee.name} (via ${created.endpoint})`);
      } else {
        console.log(`⚠️ Employee ${employee.name} might already exist or endpoint not available.`);
      }
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    }

    // If createdEmployees empty, fetch existing employees
    let allEmployees = createdEmployees.length ? createdEmployees : await getAllEmployees(adminToken);

    if (!allEmployees.length) {
      console.warn('⚠️ No employees found after create attempts. Trying to fetch /users as fallback...');
      const fallback = await apiCall('/users', 'GET', null, adminToken);
      if (fallback) {
        allEmployees = Array.isArray(fallback) ? fallback : (fallback.data || fallback.users || []);
      }
    }

    // Step 3: Add devices
    console.log('📱 Adding devices...');
    const devices = [
      { type: 'iPhone', model: 'iPhone 14 Pro', assignedTo: 'Sarah Johnson', status: 'In Use' },
      { type: 'iPhone', model: 'iPhone 13', assignedTo: 'Michael Brown', status: 'In Use' },
      { type: 'iPhone', model: 'iPhone 12', assignedTo: '', status: 'Available' },
      { type: 'iPad', model: 'iPad Pro 12.9\"', assignedTo: 'David Wilson', status: 'In Use' },
      { type: 'iPad', model: 'iPad Air', assignedTo: '', status: 'Available' },
      { type: 'MacBook', model: 'MacBook Pro 16\"', assignedTo: 'Lisa Garcia', status: 'In Use' },
      { type: 'MacBook', model: 'MacBook Air M2', assignedTo: 'Robert Martinez', status: 'In Use' },
      { type: 'MacBook', model: 'MacBook Pro 14\"', assignedTo: '', status: 'Available' },
      { type: 'Android', model: 'Samsung Galaxy S23', assignedTo: '', status: 'Available' },
      { type: 'Tablet', model: 'Microsoft Surface Pro', assignedTo: '', status: 'Under Maintenance' }
    ];

    for (const device of devices) {
      // try common device endpoints
      const created = await tryPostToEndpoints(['/devices', '/assets', '/inventory/devices'], device, adminToken);
      if (created && created.response) {
        console.log(`✅ Device added: ${device.type} ${device.model} (via ${created.endpoint})`);
      } else {
        console.log(`⚠️ Device ${device.type} ${device.model} might already exist or endpoint not available.`);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Step 4: Add leave applications (need to get employee IDs first)
    console.log('📅 Adding leave applications...');

    // Ensure we have up-to-date employee list with ids/emails
    if (!allEmployees.length) {
      allEmployees = await getAllEmployees(adminToken);
    }

    if (!allEmployees.length) {
      console.error('❌ No employees available to attach leave applications to. Aborting leave creation.');
    } else {
      // Helper to find employee by name (case-insensitive)
      const findEmployee = (name) => {
        const low = name.toLowerCase();
        return allEmployees.find(e => (e.name && e.name.toLowerCase() === low) || (e.email && e.email.toLowerCase().startsWith(name.split(' ')[0].toLowerCase())));
      };

      // Create a few leave entries for some employees
      const today = new Date();
      const formatDate = (d) => d.toISOString().split('T')[0];

      const leavesToCreate = [
        {
          // for Sarah - upcoming short leave
          employeeLookup: 'Sarah Johnson',
          startDate: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)), // +2 days
          endDate: formatDate(new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000)), // +4 days
          reason: 'PL',
        },
        {
          // for Michael - current partial leave
          employeeLookup: 'Michael Brown',
          startDate: formatDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)), // yesterday
          endDate: formatDate(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)), // tomorrow
          reason: 'SL',
        },
        {
          // for David - emergency leave starting today
          employeeLookup: 'David Wilson',
          startDate: formatDate(today),
          endDate: formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)), // +7 days
          reason: 'emergency',
        }
      ];

      // Common leave endpoints to try
      const possibleLeaveEndpoints = ['/leaves', '/leave-applications', '/leaveApplications', '/leaveApplications/create', '/leave-requests'];

      for (const leave of leavesToCreate) {
        const emp = findEmployee(leave.employeeLookup);
        if (!emp) {
          console.warn(`⚠️ Cannot find employee '${leave.employeeLookup}'. Skipping leave creation.`);
          continue;
        }

        // Build payload with both id and email (server may expect either)
        const payload = {
          employeeId: emp.id || emp._id || null,
          employeeName: emp.name || '',
          employeeEmail: emp.email || '',
          supervisor: emp.supervisor || '',
          startDate: leave.startDate,
          endDate: leave.endDate,
          reason: leave.reason,
        };

        // Try posting the leave
        const created = await tryPostToEndpoints(possibleLeaveEndpoints, payload, adminToken);
        if (created && created.response) {
          console.log(`✅ Leave created for ${emp.name} (${created.endpoint}) — ${payload.startDate} to ${payload.endDate}`);
        } else {
          console.warn(`⚠️ Could not create leave for ${emp.name}. Check if any of these endpoints exist: ${possibleLeaveEndpoints.join(', ')}`);
        }

        await new Promise(resolve => setTimeout(resolve, 120));
      }
    }

    console.log('🎉 Dummy data insertion completed. Check your API to verify records.');
  } catch (err) {
    console.error('❌ Unexpected error in addDummyDataViaAPI:', err);
  }
};

addDummyDataViaAPI();

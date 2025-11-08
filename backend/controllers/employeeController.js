import pool from '../config/database.js';

// Get all employees with their skills
export const getAllEmployees = async (req, res) => {
  try {
    // Get all employees
    const [employees] = await pool.execute(`
      SELECT e.*, 
             GROUP_CONCAT(es.skill) as skills
      FROM employees e
      LEFT JOIN employee_skills es ON e.id = es.employee_id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `);

    // Format the response
    const formattedEmployees = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      contact: emp.contact,
      supervisor: emp.supervisor,
      availableForTask: emp.available_for_task,
      useTransport: emp.use_transport,
      bandwidthStatus: emp.bandwidth_status,
      currentProject: emp.current_project,
      workload: emp.workload,
      skillSet: emp.skills ? emp.skills.split(',') : [],
      createdAt: emp.created_at,
      updatedAt: emp.updated_at
    }));

    res.json({
      success: true,
      data: formattedEmployees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single employee by ID
export const getEmployeeById = async (req, res) => {
  const { id } = req.params;

  try {
    const [employees] = await pool.execute(`
      SELECT e.*, 
             GROUP_CONCAT(es.skill) as skills
      FROM employees e
      LEFT JOIN employee_skills es ON e.id = es.employee_id
      WHERE e.id = ?
      GROUP BY e.id
    `, [id]);

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const emp = employees[0];
    const formattedEmployee = {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      contact: emp.contact,
      supervisor: emp.supervisor,
      availableForTask: emp.available_for_task,
      useTransport: emp.use_transport,
      bandwidthStatus: emp.bandwidth_status,
      currentProject: emp.current_project,
      workload: emp.workload,
      skillSet: emp.skills ? emp.skills.split(',') : [],
      createdAt: emp.created_at,
      updatedAt: emp.updated_at
    };

    res.json({
      success: true,
      data: formattedEmployee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new employee
export const createEmployee = async (req, res) => {
  const {
    name,
    email,
    contact = '',
    supervisor = '',
    availableForTask = true,
    useTransport = false,
    bandwidthStatus = 'available',
    currentProject = '',
    workload = 0,
    skillSet = []
  } = req.body;

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Check if employee with this email already exists
    const [existingEmployees] = await connection.execute(
      'SELECT id FROM employees WHERE email = ?',
      [email]
    );

    if (existingEmployees.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // Insert employee
    const [result] = await connection.execute(`
      INSERT INTO employees (
        name, email, contact, supervisor, available_for_task, 
        use_transport, bandwidth_status, current_project, workload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, email, contact, supervisor, availableForTask, useTransport, bandwidthStatus, currentProject, workload]);

    const employeeId = result.insertId;

    // Insert skills
    if (skillSet && skillSet.length > 0) {
      for (const skill of skillSet) {
        await connection.execute(
          'INSERT INTO employee_skills (employee_id, skill) VALUES (?, ?)',
          [employeeId, skill]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        id: employeeId,
        name,
        email,
        contact,
        supervisor,
        availableForTask,
        useTransport,
        bandwidthStatus,
        currentProject,
        workload,
        skillSet
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if employee exists
    const [existingEmployees] = await connection.execute(
      'SELECT id FROM employees WHERE id = ?',
      [id]
    );

    if (existingEmployees.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if email is already taken by another employee
    if (updateData.email) {
      const [emailCheck] = await connection.execute(
        'SELECT id FROM employees WHERE email = ? AND id != ?',
        [updateData.email, id]
      );

      if (emailCheck.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: 'Email is already taken by another employee'
        });
      }
    }

    // Build update query
    const updates = [];
    const values = [];

    const fieldMapping = {
      name: 'name',
      email: 'email',
      contact: 'contact',
      supervisor: 'supervisor',
      availableForTask: 'available_for_task',
      useTransport: 'use_transport',
      bandwidthStatus: 'bandwidth_status',
      currentProject: 'current_project',
      workload: 'workload'
    };

    Object.keys(fieldMapping).forEach(key => {
      if (updateData.hasOwnProperty(key)) {
        updates.push(`${fieldMapping[key]} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updates.length > 0) {
      values.push(id);
      await connection.execute(
        `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Update skills if provided
    if (updateData.skillSet !== undefined) {
      // Delete existing skills
      await connection.execute(
        'DELETE FROM employee_skills WHERE employee_id = ?',
        [id]
      );

      // Insert new skills
      if (updateData.skillSet.length > 0) {
        for (const skill of updateData.skillSet) {
          await connection.execute(
            'INSERT INTO employee_skills (employee_id, skill) VALUES (?, ?)',
            [id, skill]
          );
        }
      }
    }

    await connection.commit();

    // Get updated employee data
    const [updatedEmployees] = await connection.execute(`
      SELECT e.*, 
             GROUP_CONCAT(es.skill) as skills
      FROM employees e
      LEFT JOIN employee_skills es ON e.id = es.employee_id
      WHERE e.id = ?
      GROUP BY e.id
    `, [id]);

    const emp = updatedEmployees[0];
    const formattedEmployee = {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      contact: emp.contact,
      supervisor: emp.supervisor,
      availableForTask: emp.available_for_task,
      useTransport: emp.use_transport,
      bandwidthStatus: emp.bandwidth_status,
      currentProject: emp.current_project,
      workload: emp.workload,
      skillSet: emp.skills ? emp.skills.split(',') : [],
      updatedAt: emp.updated_at
    };

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: formattedEmployee
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if employee exists
    const [existingEmployees] = await pool.execute(
      'SELECT id FROM employees WHERE id = ?',
      [id]
    );

    if (existingEmployees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Delete employee (CASCADE will handle skills and leave applications)
    await pool.execute('DELETE FROM employees WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get employee statistics
export const getEmployeeStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_employees,
        SUM(CASE WHEN available_for_task = 1 THEN 1 ELSE 0 END) as available_employees,
        SUM(CASE WHEN use_transport = 1 THEN 1 ELSE 0 END) as transport_users,
        SUM(CASE WHEN bandwidth_status = 'available' THEN 1 ELSE 0 END) as fully_available,
        SUM(CASE WHEN bandwidth_status = 'busy' THEN 1 ELSE 0 END) as busy_employees,
        ROUND(AVG(workload), 2) as average_workload
      FROM employees
    `);

    // Get pending leaves count
    const [leaveStats] = await pool.execute(`
      SELECT COUNT(*) as pending_leaves
      FROM leave_applications 
      WHERE status = 'pending'
    `);

    // Get devices in use count
    const [deviceStats] = await pool.execute(`
      SELECT COUNT(*) as devices_in_use
      FROM devices 
      WHERE status = 'In Use'
    `);

    // Get employees on leave today
    const today = new Date().toISOString().split('T')[0];
    const [onLeaveToday] = await pool.execute(`
      SELECT la.*, e.name as employee_name
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      WHERE la.status = 'approved' 
      AND ? BETWEEN la.start_date AND la.end_date
    `, [today]);

    res.json({
      success: true,
      data: {
        totalEmployees: stats[0].total_employees,
        availableEmployees: stats[0].available_employees,
        transportUsers: stats[0].transport_users,
        fullyAvailable: stats[0].fully_available,
        busyEmployees: stats[0].busy_employees,
        averageWorkload: stats[0].average_workload,
        pendingLeaves: leaveStats[0].pending_leaves,
        devicesInUse: deviceStats[0].devices_in_use,
        onLeaveToday: onLeaveToday.map(leave => ({
          id: leave.id,
          employeeName: leave.employee_name,
          startDate: leave.start_date,
          endDate: leave.end_date,
          reason: leave.reason
        }))
      }
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
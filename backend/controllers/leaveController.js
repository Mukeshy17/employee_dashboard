import pool from '../config/database.js';

// Get all leave applications
export const getAllLeaveApplications = async (req, res) => {
  try {
    const [leaves] = await pool.execute(`
      SELECT la.*, e.name as employee_name, e.email as employee_email, e.supervisor
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      ORDER BY la.created_at DESC
    `);

    const formattedLeaves = leaves.map(leave => ({
      id: leave.id,
      employeeId: leave.employee_id,
      employeeName: leave.employee_name,
      employeeEmail: leave.employee_email,
      supervisor: leave.supervisor,
      startDate: leave.start_date,
      endDate: leave.end_date,
      reason: leave.reason,
      status: leave.status,
      appliedDate: leave.applied_date,
      createdAt: leave.created_at,
      updatedAt: leave.updated_at
    }));

    res.json({
      success: true,
      data: formattedLeaves
    });
  } catch (error) {
    console.error('Get leave applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get leave application by ID
export const getLeaveApplicationById = async (req, res) => {
  const { id } = req.params;

  try {
    const [leaves] = await pool.execute(`
      SELECT la.*, e.name as employee_name, e.email as employee_email, e.supervisor
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      WHERE la.id = ?
    `, [id]);

    if (leaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }

    const leave = leaves[0];
    const formattedLeave = {
      id: leave.id,
      employeeId: leave.employee_id,
      employeeName: leave.employee_name,
      employeeEmail: leave.employee_email,
      supervisor: leave.supervisor,
      startDate: leave.start_date,
      endDate: leave.end_date,
      reason: leave.reason,
      status: leave.status,
      appliedDate: leave.applied_date,
      createdAt: leave.created_at,
      updatedAt: leave.updated_at
    };

    res.json({
      success: true,
      data: formattedLeave
    });
  } catch (error) {
    console.error('Get leave application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new leave application
export const createLeaveApplication = async (req, res) => {
  const { employeeId, startDate, endDate, reason = '' } = req.body;

  try {
    // Get employee details
    const [employees] = await pool.execute(
      'SELECT name, email, supervisor FROM employees WHERE id = ?',
      [employeeId]
    );

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const employee = employees[0];
    const appliedDate = new Date().toISOString().split('T')[0];

    // Create leave application
    const [result] = await pool.execute(`
      INSERT INTO leave_applications (
        employee_id, employee_name, employee_email, supervisor, 
        start_date, end_date, reason, applied_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      employeeId, 
      employee.name, 
      employee.email, 
      employee.supervisor, 
      startDate, 
      endDate, 
      reason, 
      appliedDate
    ]);

    res.status(201).json({
      success: true,
      message: 'Leave application created successfully',
      data: {
        id: result.insertId,
        employeeId,
        employeeName: employee.name,
        employeeEmail: employee.email,
        supervisor: employee.supervisor,
        startDate,
        endDate,
        reason,
        status: 'pending',
        appliedDate
      }
    });
  } catch (error) {
    console.error('Create leave application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update leave application
export const updateLeaveApplication = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Check if leave application exists
    const [existingLeaves] = await pool.execute(
      'SELECT * FROM leave_applications WHERE id = ?',
      [id]
    );

    if (existingLeaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }

    const existingLeave = existingLeaves[0];

    // Check permissions (user can only edit their own pending applications, admin can edit any)
    if (!req.user.is_admin) {
      // Get employee ID from employee email
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE email = ?',
        [req.user.email]
      );

      if (employees.length === 0 || employees[0].id !== existingLeave.employee_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own leave applications'
        });
      }

      if (existingLeave.status !== 'pending') {
        return res.status(403).json({
          success: false,
          message: 'You can only edit pending leave applications'
        });
      }
    }

    // If employee ID is being changed, update employee details
    let employeeName = existingLeave.employee_name;
    let employeeEmail = existingLeave.employee_email;
    let supervisor = existingLeave.supervisor;

    if (updateData.employeeId && updateData.employeeId !== existingLeave.employee_id) {
      const [employees] = await pool.execute(
        'SELECT name, email, supervisor FROM employees WHERE id = ?',
        [updateData.employeeId]
      );

      if (employees.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      const employee = employees[0];
      employeeName = employee.name;
      employeeEmail = employee.email;
      supervisor = employee.supervisor;
    }

    // Build update query
    const updates = [];
    const values = [];

    const fieldMapping = {
      employeeId: 'employee_id',
      startDate: 'start_date',
      endDate: 'end_date',
      reason: 'reason',
      status: 'status'
    };

    Object.keys(fieldMapping).forEach(key => {
      if (updateData.hasOwnProperty(key)) {
        updates.push(`${fieldMapping[key]} = ?`);
        values.push(updateData[key]);
      }
    });

    // Always update employee details if employee changed
    if (updateData.employeeId) {
      updates.push('employee_name = ?', 'employee_email = ?', 'supervisor = ?');
      values.push(employeeName, employeeEmail, supervisor);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    values.push(id);

    await pool.execute(
      `UPDATE leave_applications SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated leave application
    const [updatedLeaves] = await pool.execute(`
      SELECT la.*, e.name as employee_name, e.email as employee_email, e.supervisor
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      WHERE la.id = ?
    `, [id]);

    const leave = updatedLeaves[0];
    const formattedLeave = {
      id: leave.id,
      employeeId: leave.employee_id,
      employeeName: leave.employee_name,
      employeeEmail: leave.employee_email,
      supervisor: leave.supervisor,
      startDate: leave.start_date,
      endDate: leave.end_date,
      reason: leave.reason,
      status: leave.status,
      appliedDate: leave.applied_date,
      updatedAt: leave.updated_at
    };

    res.json({
      success: true,
      message: 'Leave application updated successfully',
      data: formattedLeave
    });
  } catch (error) {
    console.error('Update leave application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete leave application
export const deleteLeaveApplication = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if leave application exists
    const [existingLeaves] = await pool.execute(
      'SELECT employee_id FROM leave_applications WHERE id = ?',
      [id]
    );

    if (existingLeaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }

    const existingLeave = existingLeaves[0];

    // Check permissions (user can only delete their own applications, admin can delete any)
    if (!req.user.is_admin) {
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE email = ?',
        [req.user.email]
      );

      if (employees.length === 0 || employees[0].id !== existingLeave.employee_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own leave applications'
        });
      }
    }

    await pool.execute('DELETE FROM leave_applications WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Leave application deleted successfully'
    });
  } catch (error) {
    console.error('Delete leave application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Approve or reject leave application (Admin only)
export const updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be either "approved" or "rejected"'
    });
  }

  try {
    // Check if leave application exists
    const [existingLeaves] = await pool.execute(
      'SELECT id FROM leave_applications WHERE id = ?',
      [id]
    );

    if (existingLeaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }

    await pool.execute(
      'UPDATE leave_applications SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: `Leave application ${status} successfully`
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get leave applications by employee
export const getLeaveApplicationsByEmployee = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const [leaves] = await pool.execute(`
      SELECT la.*, e.name as employee_name, e.email as employee_email, e.supervisor
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      WHERE la.employee_id = ?
      ORDER BY la.created_at DESC
    `, [employeeId]);

    const formattedLeaves = leaves.map(leave => ({
      id: leave.id,
      employeeId: leave.employee_id,
      employeeName: leave.employee_name,
      employeeEmail: leave.employee_email,
      supervisor: leave.supervisor,
      startDate: leave.start_date,
      endDate: leave.end_date,
      reason: leave.reason,
      status: leave.status,
      appliedDate: leave.applied_date,
      createdAt: leave.created_at,
      updatedAt: leave.updated_at
    }));

    res.json({
      success: true,
      data: formattedLeaves
    });
  } catch (error) {
    console.error('Get employee leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
import pool from '../config/database.js';

// Get all devices
export const getAllDevices = async (req, res) => {
  try {
    const [devices] = await pool.execute(`
      SELECT * FROM devices 
      ORDER BY created_at DESC
    `);

    const formattedDevices = devices.map(device => ({
      id: device.id,
      type: device.type,
      model: device.model,
      assignedTo: device.assigned_to,
      status: device.status,
      createdAt: device.created_at,
      updatedAt: device.updated_at
    }));

    res.json({
      success: true,
      data: formattedDevices
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get device by ID
export const getDeviceById = async (req, res) => {
  const { id } = req.params;

  try {
    const [devices] = await pool.execute(
      'SELECT * FROM devices WHERE id = ?',
      [id]
    );

    if (devices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const device = devices[0];
    const formattedDevice = {
      id: device.id,
      type: device.type,
      model: device.model,
      assignedTo: device.assigned_to,
      status: device.status,
      createdAt: device.created_at,
      updatedAt: device.updated_at
    };

    res.json({
      success: true,
      data: formattedDevice
    });
  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new device
export const createDevice = async (req, res) => {
  const {
    type,
    model,
    assignedTo = '',
    status = 'Available'
  } = req.body;

  try {
    // Validate device type
    const validTypes = ['iPhone', 'iPad', 'MacBook', 'Android', 'Tablet', 'Laptop'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid device type. Valid types are: ${validTypes.join(', ')}`
      });
    }

    // Validate status
    const validStatuses = ['In Use', 'Available', 'Under Maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
      });
    }

    // If device is assigned, verify employee exists
    if (assignedTo && assignedTo.trim() !== '') {
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE name = ?',
        [assignedTo]
      );

      if (employees.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // If assigned, status should be 'In Use'
      if (status === 'Available') {
        return res.status(400).json({
          success: false,
          message: 'Device cannot be Available if assigned to an employee'
        });
      }
    } else {
      // If not assigned, status should not be 'In Use'
      if (status === 'In Use') {
        return res.status(400).json({
          success: false,
          message: 'Device cannot be In Use without being assigned'
        });
      }
    }

    const [result] = await pool.execute(`
      INSERT INTO devices (type, model, assigned_to, status)
      VALUES (?, ?, ?, ?)
    `, [type, model, assignedTo, status]);

    res.status(201).json({
      success: true,
      message: 'Device created successfully',
      data: {
        id: result.insertId,
        type,
        model,
        assignedTo,
        status
      }
    });
  } catch (error) {
    console.error('Create device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update device
export const updateDevice = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Check if device exists
    const [existingDevices] = await pool.execute(
      'SELECT * FROM devices WHERE id = ?',
      [id]
    );

    if (existingDevices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const existingDevice = existingDevices[0];

    // Validate device type if provided
    if (updateData.type) {
      const validTypes = ['iPhone', 'iPad', 'MacBook', 'Android', 'Tablet', 'Laptop'];
      if (!validTypes.includes(updateData.type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid device type. Valid types are: ${validTypes.join(', ')}`
        });
      }
    }

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ['In Use', 'Available', 'Under Maintenance'];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
        });
      }
    }

    // If assignedTo is being changed, verify employee exists
    if (updateData.hasOwnProperty('assignedTo') && updateData.assignedTo && updateData.assignedTo.trim() !== '') {
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE name = ?',
        [updateData.assignedTo]
      );

      if (employees.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
    }

    // Business logic validation
    const newAssignedTo = updateData.hasOwnProperty('assignedTo') ? updateData.assignedTo : existingDevice.assigned_to;
    const newStatus = updateData.status || existingDevice.status;

    // If device is being assigned, status should be 'In Use'
    if (newAssignedTo && newAssignedTo.trim() !== '' && newStatus === 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Device cannot be Available if assigned to an employee'
      });
    }

    // If device is not assigned, status should not be 'In Use'
    if ((!newAssignedTo || newAssignedTo.trim() === '') && newStatus === 'In Use') {
      return res.status(400).json({
        success: false,
        message: 'Device cannot be In Use without being assigned'
      });
    }

    // Build update query
    const updates = [];
    const values = [];

    const fieldMapping = {
      type: 'type',
      model: 'model',
      assignedTo: 'assigned_to',
      status: 'status'
    };

    Object.keys(fieldMapping).forEach(key => {
      if (updateData.hasOwnProperty(key)) {
        updates.push(`${fieldMapping[key]} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    values.push(id);

    await pool.execute(
      `UPDATE devices SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated device data
    const [updatedDevices] = await pool.execute(
      'SELECT * FROM devices WHERE id = ?',
      [id]
    );

    const device = updatedDevices[0];
    const formattedDevice = {
      id: device.id,
      type: device.type,
      model: device.model,
      assignedTo: device.assigned_to,
      status: device.status,
      updatedAt: device.updated_at
    };

    res.json({
      success: true,
      message: 'Device updated successfully',
      data: formattedDevice
    });
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete device
export const deleteDevice = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if device exists
    const [existingDevices] = await pool.execute(
      'SELECT * FROM devices WHERE id = ?',
      [id]
    );

    if (existingDevices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const device = existingDevices[0];

    // Check if device is currently assigned
    if (device.assigned_to && device.assigned_to.trim() !== '') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete device that is assigned to ${device.assigned_to}. Please unassign first.`
      });
    }

    await pool.execute('DELETE FROM devices WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get device statistics
export const getDeviceStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_devices,
        SUM(CASE WHEN status = 'In Use' THEN 1 ELSE 0 END) as devices_in_use,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available_devices,
        SUM(CASE WHEN status = 'Under Maintenance' THEN 1 ELSE 0 END) as maintenance_devices
      FROM devices
    `);

    // Get device counts by type
    const [deviceTypes] = await pool.execute(`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'In Use' THEN 1 ELSE 0 END) as in_use,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'Under Maintenance' THEN 1 ELSE 0 END) as maintenance
      FROM devices
      GROUP BY type
      ORDER BY count DESC
    `);

    // Get assignment statistics
    const [assignmentStats] = await pool.execute(`
      SELECT 
        assigned_to,
        COUNT(*) as device_count,
        GROUP_CONCAT(CONCAT(type, ' - ', model)) as devices
      FROM devices
      WHERE assigned_to IS NOT NULL AND assigned_to != ''
      GROUP BY assigned_to
      ORDER BY device_count DESC
    `);

    res.json({
      success: true,
      data: {
        overview: {
          totalDevices: stats[0].total_devices,
          devicesInUse: stats[0].devices_in_use,
          availableDevices: stats[0].available_devices,
          maintenanceDevices: stats[0].maintenance_devices,
          utilizationRate: stats[0].total_devices > 0 
            ? Math.round((stats[0].devices_in_use / stats[0].total_devices) * 100) 
            : 0
        },
        devicesByType: deviceTypes.map(item => ({
          type: item.type,
          total: item.count,
          inUse: item.in_use,
          available: item.available,
          maintenance: item.maintenance,
          utilizationRate: item.count > 0 
            ? Math.round((item.in_use / item.count) * 100) 
            : 0
        })),
        assignments: assignmentStats.map(item => ({
          employeeName: item.assigned_to,
          deviceCount: item.device_count,
          devices: item.devices ? item.devices.split(',') : []
        }))
      }
    });
  } catch (error) {
    console.error('Get device stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Assign device to employee
export const assignDevice = async (req, res) => {
  const { id } = req.params;
  const { employeeName } = req.body;

  try {
    // Check if device exists
    const [devices] = await pool.execute(
      'SELECT * FROM devices WHERE id = ?',
      [id]
    );

    if (devices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const device = devices[0];

    // If assigning to someone
    if (employeeName && employeeName.trim() !== '') {
      // Check if device is available
      if (device.status !== 'Available') {
        return res.status(400).json({
          success: false,
          message: `Device is currently ${device.status.toLowerCase()} and cannot be assigned`
        });
      }

      // Verify employee exists
      const [employees] = await pool.execute(
        'SELECT id, name FROM employees WHERE name = ?',
        [employeeName]
      );

      if (employees.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Assign device
      await pool.execute(
        'UPDATE devices SET assigned_to = ?, status = ? WHERE id = ?',
        [employeeName, 'In Use', id]
      );

      res.json({
        success: true,
        message: `Device successfully assigned to ${employeeName}`,
        data: {
          deviceId: id,
          deviceType: device.type,
          deviceModel: device.model,
          assignedTo: employeeName,
          status: 'In Use'
        }
      });
    } else {
      // Unassigning device
      if (device.status !== 'In Use') {
        return res.status(400).json({
          success: false,
          message: 'Device is not currently assigned'
        });
      }

      const previousAssignee = device.assigned_to;

      // Unassign device
      await pool.execute(
        'UPDATE devices SET assigned_to = ?, status = ? WHERE id = ?',
        ['', 'Available', id]
      );

      res.json({
        success: true,
        message: `Device successfully unassigned from ${previousAssignee}`,
        data: {
          deviceId: id,
          deviceType: device.type,
          deviceModel: device.model,
          previousAssignee,
          assignedTo: '',
          status: 'Available'
        }
      });
    }
  } catch (error) {
    console.error('Assign device error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get devices by employee
export const getDevicesByEmployee = async (req, res) => {
  const { employeeName } = req.params;

  try {
    // Verify employee exists
    const [employees] = await pool.execute(
      'SELECT id, name, email FROM employees WHERE name = ?',
      [employeeName]
    );

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const [devices] = await pool.execute(`
      SELECT * FROM devices 
      WHERE assigned_to = ?
      ORDER BY created_at DESC
    `, [employeeName]);

    const formattedDevices = devices.map(device => ({
      id: device.id,
      type: device.type,
      model: device.model,
      assignedTo: device.assigned_to,
      status: device.status,
      createdAt: device.created_at,
      updatedAt: device.updated_at
    }));

    res.json({
      success: true,
      data: {
        employee: employees[0],
        devices: formattedDevices,
        deviceCount: formattedDevices.length
      }
    });
  } catch (error) {
    console.error('Get devices by employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark device for maintenance
export const markForMaintenance = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if device exists
    const [devices] = await pool.execute(
      'SELECT * FROM devices WHERE id = ?',
      [id]
    );

    if (devices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const device = devices[0];

    if (device.status === 'Under Maintenance') {
      return res.status(400).json({
        success: false,
        message: 'Device is already under maintenance'
      });
    }

    const previousAssignee = device.assigned_to;

    // Mark for maintenance and unassign if necessary
    await pool.execute(
      'UPDATE devices SET assigned_to = ?, status = ? WHERE id = ?',
      ['', 'Under Maintenance', id]
    );

    res.json({
      success: true,
      message: 'Device marked for maintenance successfully',
      data: {
        deviceId: id,
        deviceType: device.type,
        deviceModel: device.model,
        previousAssignee,
        status: 'Under Maintenance'
      }
    });
  } catch (error) {
    console.error('Mark for maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Complete maintenance and mark as available
export const completeMaintenance = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if device exists
    const [devices] = await pool.execute(
      'SELECT * FROM devices WHERE id = ?',
      [id]
    );

    if (devices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const device = devices[0];

    if (device.status !== 'Under Maintenance') {
      return res.status(400).json({
        success: false,
        message: 'Device is not under maintenance'
      });
    }

    // Mark as available
    await pool.execute(
      'UPDATE devices SET status = ? WHERE id = ?',
      ['Available', id]
    );

    res.json({
      success: true,
      message: 'Device maintenance completed and marked as available',
      data: {
        deviceId: id,
        deviceType: device.type,
        deviceModel: device.model,
        status: 'Available'
      }
    });
  } catch (error) {
    console.error('Complete maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
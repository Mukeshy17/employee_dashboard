import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const createDatabase = async () => {
  try {
    // Connect without database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'employee_management';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    // Connect to the database
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName
    });

    // Create users table with is_admin
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert admin user (won't duplicate due to UNIQUE email)
    const adminPassword = await bcrypt.hash('password123', 10);
    await db.execute(
      `INSERT IGNORE INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)`,
      ['ravindra yadav', 'r.rajnath.yadav@accenture.com', adminPassword, 1]
    );

    // Employees table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        contact VARCHAR(50),
        supervisor VARCHAR(255),
        available_for_task BOOLEAN DEFAULT TRUE,
        use_transport BOOLEAN DEFAULT FALSE,
        bandwidth_status ENUM('available', 'partially-available', 'busy') DEFAULT 'available',
        current_project VARCHAR(255),
        workload INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Employee skills table (many-to-many relationship)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS employee_skills (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        skill VARCHAR(100) NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_employee_skill (employee_id, skill)
      )
    `);

    // Leave applications table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS leave_applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        employee_email VARCHAR(255) NOT NULL,
        supervisor VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        applied_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Devices table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS devices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type VARCHAR(100) NOT NULL,
        model VARCHAR(255) NOT NULL,
        assigned_to VARCHAR(255),
        status ENUM('In Use', 'Available', 'Under Maintenance') DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All tables created successfully');

    // Insert sample data
    const insertSampleData = async () => {
      // Hash password for sample users
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Sample users
      const users = [
        ['John Smith', 'john.smith@company.com', hashedPassword, false],
        ['Admin User', 'admin@company.com', hashedPassword, true],
        ['Ravindra Yadav', 'r.rajnath.yadav@accenture.com', hashedPassword, false],
        ['Emily Davis', 'emily.davis@company.com', hashedPassword, false],
        ['Alex Chen', 'alex.chen@company.com', hashedPassword, false]
      ];

      for (const user of users) {
        try {
          await db.execute(
            'INSERT IGNORE INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
            user
          );
        } catch (error) {
          // Ignore duplicate entries
        }
      }

      // Sample employees
      const employees = [
        ['Ravindra Yadav', 'r.rajnath.yadav@accenture.com', '+918652819948', 'Gautam Bellare', true, true, 'available', '', 70],
        ['Emily Davis', 'emily.davis@company.com', '+1 (555) 234-5678', 'Michael Brown', false, true, 'busy', 'E-commerce Platform', 95],
        ['Alex Chen', 'alex.chen@company.com', '+1 (555) 345-6789', 'Sarah Johnson', true, false, 'partially-available', 'Mobile App Update', 60],
        ['John Smith', 'john.smith@company.com', '+1 (555) 123-4567', 'Sarah Johnson', true, true, 'available', '', 40]
      ];

      for (const employee of employees) {
        try {
          await db.execute(
            'INSERT IGNORE INTO employees (name, email, contact, supervisor, available_for_task, use_transport, bandwidth_status, current_project, workload) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            employee
          );
        } catch (error) {
          // Ignore duplicate entries
        }
      }

      // Sample skills
      const skills = [
        [1, 'CLM'], [1, 'Email'], [1, 'Website'], [1, 'Banner'],
        [2, 'Python'], [2, 'Django'], [2, 'PostgreSQL'],
        [3, 'React Native'], [3, 'iOS'], [3, 'Android'],
        [4, 'JavaScript'], [4, 'React'], [4, 'Node.js']
      ];

      for (const skill of skills) {
        try {
          await db.execute(
            'INSERT IGNORE INTO employee_skills (employee_id, skill) VALUES (?, ?)',
            skill
          );
        } catch (error) {
          // Ignore duplicate entries
        }
      }

      // Sample leave applications
      const leaves = [
        [4, 'John Smith', 'john.smith@company.com', 'Sarah Johnson', '2024-10-15', '2024-10-17', 'PL', 'approved', '2024-09-25'],
        [2, 'Emily Davis', 'emily.davis@company.com', 'Michael Brown', '2024-10-22', '2024-10-22', 'SL', 'pending', '2024-09-26']
      ];

      for (const leave of leaves) {
        try {
          await db.execute(
            'INSERT IGNORE INTO leave_applications (employee_id, employee_name, employee_email, supervisor, start_date, end_date, reason, status, applied_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            leave
          );
        } catch (error) {
          // Ignore duplicate entries
        }
      }

      // Sample devices
      const devices = [
        ['iPhone', 'iPhone 15 Pro', 'John Smith', 'In Use'],
        ['iPad', 'iPad Air', 'Emily Davis', 'In Use'],
        ['MacBook', 'MacBook Pro 14"', 'Alex Chen', 'In Use'],
        ['iPhone', 'iPhone 14', '', 'Available'],
        ['iPad', 'iPad Pro', '', 'Available']
      ];

      for (const device of devices) {
        try {
          await db.execute(
            'INSERT IGNORE INTO devices (type, model, assigned_to, status) VALUES (?, ?, ?, ?)',
            device
          );
        } catch (error) {
          // Ignore duplicate entries
        }
      }

      console.log('✅ Sample data inserted successfully');
    };

    await insertSampleData();

    await db.end();
    console.log('🎉 Database initialization completed with admin user seeded');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run the initialization
createDatabase();
import pool from '../config/database.js';

const addResetTokenColumnsToUsers = async () => {
  try {
    console.log('Adding reset_token and reset_token_expires columns to users table...');
    
    // Check if columns exist
    const [columns] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME IN ('reset_token', 'reset_token_expires')`
    );

    if (columns.length < 2) {
      // Add reset_token column
      try {
        await pool.execute(
          `ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL DEFAULT NULL`
        );
        console.log('✅ Added reset_token column');
      } catch (error) {
        if (!error.message.includes('Duplicate column name')) {
          throw error;
        }
        console.log('ℹ️  reset_token column already exists');
      }

      // Add reset_token_expires column
      try {
        await pool.execute(
          `ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL DEFAULT NULL`
        );
        console.log('✅ Added reset_token_expires column');
      } catch (error) {
        if (!error.message.includes('Duplicate column name')) {
          throw error;
        }
        console.log('ℹ️  reset_token_expires column already exists');
      }
    } else {
      console.log('ℹ️  Reset token columns already exist');
    }

    console.log('✅ Password reset setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during password reset setup:', error.message);
    process.exit(1);
  }
};

addResetTokenColumnsToUsers();

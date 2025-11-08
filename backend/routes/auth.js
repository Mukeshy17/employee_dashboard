import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} from '../controllers/employeeController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { login, register, getProfile, updateProfile, logout } from '../controllers/authController.js';

const router = express.Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.post('/logout', authenticateToken, logout);

/**
 * GET /api/employees
 * - Optional query params: page, limit, q (search)
 * - Controller should read req.query for paging/search behavior if implemented
 */
router.get('/', authenticateToken, getAllEmployees);

/**
 * GET /api/employees/stats
 * - Returns aggregated employee statistics
 */
router.get('/stats', authenticateToken, getEmployeeStats);

/**
 * GET /api/employees/me
 * - Shortcut for the current authenticated user to fetch their own profile/employee data.
 * - This returns the req.user (from authenticateToken). If you want to return a full
 *   employee record (from employees table) you'll need a controller function to fetch
 *   employee by user id/email and replace this handler with a call to that controller.
 */
router.get('/me', authenticateToken, (req, res) => {
  // Basic profile returned from authentication lookup (safe default)
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

/**
 * GET /api/employees/:id
 * - Returns the employee by ID.
 * - If you later want to restrict this route so only the resource owner or admin can
 *   access it, implement and use a requireOwnershipOrAdmin middleware here.
 */
router.get('/:id', authenticateToken, getEmployeeById);

// POST, PUT, DELETE routes (admin only)
router.post('/', requireAdmin, validate(schemas.createEmployee), createEmployee);
router.put('/:id', requireAdmin, validate(schemas.updateEmployee), updateEmployee);
router.delete('/:id', requireAdmin, deleteEmployee);

export default router;

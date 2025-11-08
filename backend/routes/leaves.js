import express from 'express';
import {
  getAllLeaveApplications,
  getLeaveApplicationById,
  createLeaveApplication,
  updateLeaveApplication,
  deleteLeaveApplication,
  updateLeaveStatus,
  getLeaveApplicationsByEmployee
} from '../controllers/leaveController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All leave routes require authentication
router.use(authenticateToken);

// GET routes
router.get('/', getAllLeaveApplications);
router.get('/employee/:employeeId', getLeaveApplicationsByEmployee);
router.get('/:id', getLeaveApplicationById);

// POST routes (all authenticated users can apply for leave)
router.post('/', validate(schemas.createLeaveApplication), createLeaveApplication);

// PUT routes
router.put('/:id', validate(schemas.updateLeaveApplication), updateLeaveApplication);
router.patch('/:id/status', requireAdmin, updateLeaveStatus);

// DELETE routes
router.delete('/:id', deleteLeaveApplication);

export default router;
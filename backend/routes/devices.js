import express from 'express';
import {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceStats,
  assignDevice
} from '../controllers/deviceController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All device routes require authentication
router.use(authenticateToken);

// GET routes (accessible to all authenticated users)
router.get('/', getAllDevices);
router.get('/stats', getDeviceStats);
router.get('/:id', getDeviceById);

// POST, PUT, DELETE routes (admin only)
router.post('/', requireAdmin, validate(schemas.createDevice), createDevice);
router.put('/:id', requireAdmin, validate(schemas.updateDevice), updateDevice);
router.patch('/:id/assign', requireAdmin, assignDevice);
router.delete('/:id', requireAdmin, deleteDevice);

export default router;
import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} from '../controllers/employeeController.js';
import {  authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticateToken);

/**
 * @openapi
 * /employees:
 *   get:
 *     summary: Get all employees
 *     tags:
 *       - Employees
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', getAllEmployees);
/**
 * @openapi
 * /employees/stats:
 *   get:
 *     summary: Get employee statistics
 *     description: Retrieve overall employee statistics such as total employees, department counts, and gender distribution.
 *     tags:
 *       - Employees
 *     responses:
 *       200:
 *         description: Employee statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEmployees:
 *                       type: integer
 *                       example: 120
 *                     departments:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         Engineering: 45
 *                         HR: 10
 *                         Sales: 30
 *                         Marketing: 20
 *                         Support: 15
 *                     genderDistribution:
 *                       type: object
 *                       properties:
 *                         male:
 *                           type: integer
 *                           example: 80
 *                         female:
 *                           type: integer
 *                           example: 40
 */
router.get('/stats', getEmployeeStats);

/**
 * @openapi
 * /employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee details
 */
router.get('/:id', getEmployeeById);

// POST, PUT, DELETE routes (admin only)
/**
 * @openapi
 * /employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee created
 */
router.post('/', requireAdmin, validate(schemas.createEmployee), createEmployee);
/**
 * @openapi
 * /employees/{id}:
 *   put:
 *     summary: Update employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee updated
 */

router.put('/:id', requireAdmin, validate(schemas.updateEmployee), updateEmployee);

/**
 * @openapi
 * /employees/{id}:
 *   delete:
 *     summary: Delete employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee deleted
 */
router.delete('/:id', requireAdmin, deleteEmployee);

export default router;
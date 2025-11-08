import Joi from 'joi';

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
export const schemas = {
  // Auth schemas
  register: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    isAdmin: Joi.boolean().default(false)
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Employee schemas
  createEmployee: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    contact: Joi.string().max(50).allow(''),
    supervisor: Joi.string().max(255).allow(''),
    availableForTask: Joi.boolean().default(true),
    useTransport: Joi.boolean().default(false),
    bandwidthStatus: Joi.string().valid('available', 'partially-available', 'busy').default('available'),
    currentProject: Joi.string().max(255).allow(''),
    workload: Joi.number().min(0).max(100).default(0),
    skillSet: Joi.array().items(Joi.string().max(100)).default([])
  }),

  updateEmployee: Joi.object({
    name: Joi.string().min(2).max(255),
    email: Joi.string().email(),
    contact: Joi.string().max(50).allow(''),
    supervisor: Joi.string().max(255).allow(''),
    availableForTask: Joi.boolean(),
    useTransport: Joi.boolean(),
    bandwidthStatus: Joi.string().valid('available', 'partially-available', 'busy'),
    currentProject: Joi.string().max(255).allow(''),
    workload: Joi.number().min(0).max(100),
    skillSet: Joi.array().items(Joi.string().max(100))
  }),

  // Leave application schemas
  createLeaveApplication: Joi.object({
    employee_name: Joi.string().required(),
    employee_email: Joi.string().email().required(),
    supervisor: Joi.string().allow('', null),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
    reason: Joi.string().allow('', null),
    status: Joi.string().valid('pending', 'approved', 'rejected').default('pending'),
    applied_date: Joi.date().iso() // Add this line
  }),

  updateLeaveApplication: Joi.object({
    employeeId: Joi.number().integer().positive(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    reason: Joi.string().max(255).allow(''),
    status: Joi.string().valid('pending', 'approved', 'rejected')
  }),

  // Device schemas
  createDevice: Joi.object({
    type: Joi.string().max(100).required(),
    model: Joi.string().max(255).required(),
    assignedTo: Joi.string().max(255).allow(''),
    status: Joi.string().valid('In Use', 'Available', 'Under Maintenance').default('Available')
  }),

  updateDevice: Joi.object({
    type: Joi.string().max(100),
    model: Joi.string().max(255),
    assignedTo: Joi.string().max(255).allow(''),
    status: Joi.string().valid('In Use', 'Available', 'Under Maintenance')
  })
};
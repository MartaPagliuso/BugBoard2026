import { Router } from 'express';
import { DashboardController } from '../controller/dashboard.controller.js';
import { requireAuth, requireRole, blockIfMustChangePassword } from '../middleware/auth.middleware.js';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth, blockIfMustChangePassword, requireRole('admin'));
dashboardRouter.get('/', DashboardController.getStats);
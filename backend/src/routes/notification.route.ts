import { Router } from 'express';
import { NotificationController } from '../controller/notification.controller.js';
import { requireAuth, blockIfMustChangePassword } from '../middleware/auth.middleware.js';

export const notificationRouter = Router();

notificationRouter.use(requireAuth, blockIfMustChangePassword);

notificationRouter.get('/', NotificationController.list);
notificationRouter.get('/unread-count', NotificationController.unreadCount);
notificationRouter.patch('/read-all', NotificationController.markAllAsRead);
notificationRouter.patch('/:id/read', NotificationController.markAsRead);
import { Router } from "express";
import { UserController } from "../controller/users.controller.js";
import { blockIfMustChangePassword, requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const userRouter = Router();

userRouter.post('/', requireAuth, blockIfMustChangePassword, requireRole('admin'),  UserController.create);
userRouter.get('/', requireAuth, blockIfMustChangePassword, requireRole('admin'), UserController.list);
userRouter.get('/me', requireAuth, UserController.me);
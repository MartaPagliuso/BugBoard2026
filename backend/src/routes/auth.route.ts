import { Router } from "express";
import { AuthController } from "../controller/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post('/login', AuthController.login);

authRouter.post('/logout', requireAuth, AuthController.logout);

authRouter.post('/change-password', requireAuth, AuthController.changePassword);

authRouter.post('/refresh', AuthController.refresh);
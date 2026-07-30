import { Router } from "express";
import { UserController } from "../controller/users.controller.js";
import { blockIfMustChangePassword, requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const userRouter = Router();

// rotta per la creazione di un nuovo utente
userRouter.post('/', requireAuth, blockIfMustChangePassword, requireRole('admin'),  UserController.createUserController);
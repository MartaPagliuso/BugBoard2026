import { Router } from "express";
import { UserController } from "../controller/users.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const userRouter = Router();

// rotta per la creazione di un nuovo utente
userRouter.post('/', UserController.createUserController);


userRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
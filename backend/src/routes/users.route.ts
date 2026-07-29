import { Router } from "express";
import { UserController } from "../controller/users.controller.js";

export const userRouter = Router();

// rotta per la creazione di un nuovo utente
userRouter.post('/', UserController.createUserController);

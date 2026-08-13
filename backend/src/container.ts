import { UserRepository } from "./repository/users.repository.js";
import { UserService } from "./service/user.service.js";

import { AuthService } from "./service/auth.service.js";

import { CommentRepository } from "./repository/comments.repository.js";
import { CommentService } from "./service/comment.service.js";

import { NotificationRepository } from "./repository/notifications.repository.js";
import { NotificationService } from "./service/notification.service.js";

import { MailService } from "./service/mail.service.js";

export const userRepository = new UserRepository();
export const userService = new UserService(userRepository);

export const authService = new AuthService(userRepository);

const commentRepository = new CommentRepository();
export const commentService = new CommentService(commentRepository);

const mailService = new MailService();

const notificationRepository = new NotificationRepository();
export const notificationService = new NotificationService(notificationRepository, userRepository, mailService);

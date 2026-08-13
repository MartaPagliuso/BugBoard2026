import { UserRepository } from "./repository/users.repository.js";
import { UserService } from "./service/user.service.js";

import { AuthService } from "./service/auth.service.js";

import { CommentRepository } from "./repository/comments.repository.js";
import { CommentService } from "./service/comment.service.js";

import { NotificationRepository } from "./repository/notifications.repository.js";
import { NotificationService } from "./service/notification.service.js";

import { MailService } from "./service/mail.service.js";

import { IssueRepository } from "./repository/issues.repository.js";
import { IssueService } from "./service/issue.service.js";

import { DashboardRepository } from "./repository/dashboard.repository.js";
import { DashboardService } from "./service/dashboard.service.js";

export const userRepository = new UserRepository();
export const userService = new UserService(userRepository);

const mailService = new MailService();

const notificationRepository = new NotificationRepository();
export const notificationService = new NotificationService(notificationRepository, userRepository, mailService);

export const authService = new AuthService(userRepository);

const issueRepository = new IssueRepository();
export const issueService = new IssueService(issueRepository, userRepository, notificationService); 

const commentRepository = new CommentRepository();
export const commentService = new CommentService(commentRepository, issueRepository);


const dashboardRepository = new DashboardRepository();
export const dashboardService = new DashboardService(dashboardRepository);

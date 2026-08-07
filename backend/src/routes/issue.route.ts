import { Router } from "express";
import { IssueController } from "../controller/issue.controller.js";
import { CommentController } from "../controller/comment.controller.js";
import { requireAuth, blockIfMustChangePassword, requireRole, denyViewers } from "../middleware/auth.middleware.js";
import { uploadImage } from "../middleware/upload.middleware.js";

export const issueRouter = Router();

issueRouter.use(requireAuth, blockIfMustChangePassword);

issueRouter.post('/', denyViewers, IssueController.create);
issueRouter.get('/', IssueController.list);
issueRouter.get('/:id', IssueController.getById);
issueRouter.patch('/:id/assignee', requireRole('admin'), IssueController.assign);
issueRouter.patch('/:id/status', denyViewers, IssueController.updateStatus);

issueRouter.post('/:id/comments', denyViewers, CommentController.addComment);
issueRouter.get('/:id/comments', CommentController.listByIssue);

issueRouter.patch('/:id/due-date', requireRole('admin'), IssueController.setDueDate);

issueRouter.post('/:id/image', denyViewers, uploadImage, IssueController.uploadImage);
issueRouter.get('/:id/image', IssueController.getImage);
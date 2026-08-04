import { Router } from "express";
import { IssueController } from "../controller/issue.controller.js";
import { CommentController } from "../controller/comment.controller.js";
import { requireAuth, blockIfMustChangePassword, requireRole } from "../middleware/auth.middleware.js";

export const issueRouter = Router();

issueRouter.use(requireAuth, blockIfMustChangePassword);

issueRouter.post('/', IssueController.create);
issueRouter.get('/', IssueController.list);
issueRouter.get('/:id', IssueController.getById);
issueRouter.patch('/:id/assignee', requireRole('admin'), IssueController.assing);
issueRouter.patch('/:id/status', IssueController.updateStatus);

issueRouter.post('/:id/comments', CommentController.addComment);
issueRouter.get('/:id/comments', CommentController.listByIssue);
import { IssuePerson } from "./issue.model";

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: IssuePerson;
}
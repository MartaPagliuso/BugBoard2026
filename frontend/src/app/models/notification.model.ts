export interface Notification {
  id: string;
  recipientId: string;
  issueId: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationList {
  items: Notification[];
  total: number;
  limit: number;
}
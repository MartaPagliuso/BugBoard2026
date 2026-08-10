export type UserRole = 'viewer' | 'user' | 'admin';

export interface User {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
  createdAt: string;
}
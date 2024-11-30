import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
}).partial();

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type ApiResponse<T> = {
  data: T;
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};
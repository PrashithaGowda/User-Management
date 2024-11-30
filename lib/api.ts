import { User, ApiResponse } from './types';

const API_URL = 'https://reqres.in/api';

export async function getUsers(page: number = 1): Promise<ApiResponse<User[]>> {
  const response = await fetch(`${API_URL}/users?page=${page}&per_page=5`);
  if (!response.ok) throw new Error('Failed to fetch users');
  const data = await response.json();
  
  return {
    data: data.data.map((user: any) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role || 'user',
    })),
    page: data.page,
    per_page: data.per_page,
    total: data.total,
    total_pages: data.total_pages,
  };
}

export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: userData.name.split(' ')[0],
      last_name: userData.name.split(' ')[1] || '',
      email: userData.email,
      role: userData.role,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create user');
  }

  const data = await response.json();
  return {
    id: data.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
  };
}

export async function updateUser(id: number, userData: Partial<User>): Promise<User> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: userData.name?.split(' ')[0],
      last_name: userData.name?.split(' ')[1] || '',
      email: userData.email,
      role: userData.role,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }

  const data = await response.json();
  return {
    id,
    name: userData.name || '',
    email: userData.email || '',
    role: userData.role || 'user',
  };
}

export async function deleteUser(id: number): Promise<boolean> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }

  return true;
}
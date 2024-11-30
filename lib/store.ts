import { create } from 'zustand';
import { User } from './types';

interface UsersState {
  users: User[];
  currentPage: number;
  searchQuery: string;
  setUsers: (users: User[]) => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  currentPage: 1,
  searchQuery: '',
  setUsers: (users) => set({ users }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.clouddevops.ca';

export interface Book {
  id?: string;
  title: string;
  author: string;
  description?: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const bookService = {
  getAll: () => api.get<Book[]>('/books'),
  getById: (id: string) => api.get<Book>(`/books/${id}`),
  create: (book: Book) => api.post<Book>('/books', book),
  update: (id: string, book: Book) => api.put<Book>(`/books/${id}`, book),
  delete: (id: string) => api.delete(`/books/${id}`),
};

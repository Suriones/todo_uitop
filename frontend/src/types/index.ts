export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Todo {
  id: string;
  text: string;
  category_id: string;
  category_name: string;
  completed: boolean;
  created_at: string;
}

export interface CreateTodoPayload {
  text: string;
  category_id: string;
}

export interface ApiError {
  error: string;
}

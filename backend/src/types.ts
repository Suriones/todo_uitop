export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Todo {
  id: string;
  text: string;
  category_id: string;
  category_name?: string;
  completed: boolean;
  created_at: string;
}

export interface TodoRow {
  id: string;
  text: string;
  category_id: string;
  category_name: string;
  completed: number;
  created_at: string;
}

export interface CreateTodoBody {
  text: string;
  category_id: string;
}

export interface UpdateTodoBody {
  completed: boolean;
}

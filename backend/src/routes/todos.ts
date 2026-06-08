import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { TodoRow, CreateTodoBody, UpdateTodoBody } from '../types';

const router = Router();

const MAX_TASKS_PER_CATEGORY = 5;

// GET /todos?category=<category_id>
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { category } = req.query;

  let query = `
    SELECT t.id, t.text, t.category_id, c.name as category_name, t.completed, t.created_at
    FROM todos t
    JOIN categories c ON t.category_id = c.id
  `;
  const params: string[] = [];

  if (category && typeof category === 'string') {
    query += ' WHERE t.category_id = ?';
    params.push(category);
  }

  query += ' ORDER BY t.created_at DESC';

  const rows = db.prepare(query).all(...params) as TodoRow[];
  const todos = rows.map((row) => ({
    id: row.id,
    text: row.text,
    category_id: row.category_id,
    category_name: row.category_name,
    completed: row.completed === 1,
    created_at: row.created_at,
  }));

  res.json(todos);
});

// POST /todos
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const { text, category_id }: CreateTodoBody = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({ error: 'Task text is required' });
    return;
  }

  if (!category_id || typeof category_id !== 'string') {
    res.status(400).json({ error: 'Category is required' });
    return;
  }

  // Check category exists
  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
  if (!category) {
    res.status(400).json({ error: 'Category not found' });
    return;
  }

  // Enforce 5-task limit per category
  const countRow = db
    .prepare('SELECT COUNT(*) as cnt FROM todos WHERE category_id = ?')
    .get(category_id) as { cnt: number };

  if (countRow.cnt >= MAX_TASKS_PER_CATEGORY) {
    res.status(400).json({
      error: `Category already has ${MAX_TASKS_PER_CATEGORY} tasks. Please complete or delete some tasks first.`,
    });
    return;
  }

  const id = uuidv4();
  db.prepare(
    'INSERT INTO todos (id, text, category_id, completed) VALUES (?, ?, ?, 0)'
  ).run(id, text.trim(), category_id);

  const row = db
    .prepare(
      `SELECT t.id, t.text, t.category_id, c.name as category_name, t.completed, t.created_at
       FROM todos t JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`
    )
    .get(id) as TodoRow;

  res.status(201).json({
    id: row.id,
    text: row.text,
    category_id: row.category_id,
    category_name: row.category_name,
    completed: row.completed === 1,
    created_at: row.created_at,
  });
});

// PATCH /todos/:id
router.patch('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const { id } = req.params;
  const { completed }: UpdateTodoBody = req.body;

  if (typeof completed !== 'boolean') {
    res.status(400).json({ error: 'Field "completed" must be a boolean' });
    return;
  }

  const todo = db.prepare('SELECT id FROM todos WHERE id = ?').get(id);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }

  db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(completed ? 1 : 0, id);

  const row = db
    .prepare(
      `SELECT t.id, t.text, t.category_id, c.name as category_name, t.completed, t.created_at
       FROM todos t JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`
    )
    .get(id) as TodoRow;

  res.json({
    id: row.id,
    text: row.text,
    category_id: row.category_id,
    category_name: row.category_name,
    completed: row.completed === 1,
    created_at: row.created_at,
  });
});

// DELETE /todos/:id
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const { id } = req.params;

  const todo = db.prepare('SELECT id FROM todos WHERE id = ?').get(id);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }

  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  res.status(204).send();
});

export default router;

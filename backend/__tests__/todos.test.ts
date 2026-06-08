import request from 'supertest';
import Database from 'better-sqlite3';
import path from 'path';
import express from 'express';
import cors from 'cors';

// Use in-memory DB for tests by overriding DB_PATH
process.env.DB_PATH = ':memory:';

// Re-import after setting env var
import app from '../src/index';

describe('Todos API', () => {
  let categoryId: string;

  beforeAll(async () => {
    // Get seeded category
    const res = await request(app).get('/categories');
    categoryId = res.body[0].id;
  });

  it('GET /todos returns empty array', async () => {
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /todos creates a todo', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ text: 'Test task', category_id: categoryId });
    expect(res.status).toBe(201);
    expect(res.body.text).toBe('Test task');
    expect(res.body.completed).toBe(false);
  });

  it('POST /todos returns 400 when text is empty', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ text: '', category_id: categoryId });
    expect(res.status).toBe(400);
  });

  it('POST /todos returns 400 when category limit reached', async () => {
    // Create 4 more tasks to reach limit of 5
    for (let i = 0; i < 4; i++) {
      await request(app)
        .post('/todos')
        .send({ text: `Task ${i + 2}`, category_id: categoryId });
    }
    // 6th should fail
    const res = await request(app)
      .post('/todos')
      .send({ text: 'Task 6', category_id: categoryId });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/5 tasks/);
  });

  it('PATCH /todos/:id updates completed status', async () => {
    const createRes = await request(app)
      .post('/todos')
      .send({ text: 'Update me', category_id: (await request(app).get('/categories')).body[1].id });
    const todoId = createRes.body.id;

    const patchRes = await request(app)
      .patch(`/todos/${todoId}`)
      .send({ completed: true });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.completed).toBe(true);
  });

  it('DELETE /todos/:id removes a todo', async () => {
    const catRes = await request(app).get('/categories');
    const cat = catRes.body[2];
    const createRes = await request(app)
      .post('/todos')
      .send({ text: 'Delete me', category_id: cat.id });
    const todoId = createRes.body.id;

    const deleteRes = await request(app).delete(`/todos/${todoId}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get('/todos');
    const found = getRes.body.find((t: { id: string }) => t.id === todoId);
    expect(found).toBeUndefined();
  });
});

import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { Category } from '../types';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all() as Category[];
  res.json(categories);
});

export default router;

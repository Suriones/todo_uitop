import express from 'express';
import cors from 'cors';
import todosRouter from './routes/todos';
import categoriesRouter from './routes/categories';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/todos', todosRouter);
app.use('/categories', categoriesRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Only start listening when run directly (not when imported by tests)
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

export default app;

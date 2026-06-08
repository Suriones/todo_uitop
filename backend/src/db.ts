import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'todos.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      category_id TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // Seed default categories if empty
  const count = (db.prepare('SELECT COUNT(*) as cnt FROM categories').get() as { cnt: number }).cnt;
  if (count === 0) {
    const insert = db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)');
    const seedCategories = [
      ['cat-work', 'Work'],
      ['cat-personal', 'Personal'],
      ['cat-shopping', 'Shopping'],
      ['cat-health', 'Health'],
      ['cat-learning', 'Learning'],
    ];
    const insertMany = db.transaction(() => {
      for (const [id, name] of seedCategories) {
        insert.run(id, name);
      }
    });
    insertMany();
  }
}

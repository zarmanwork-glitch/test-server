import { serve } from 'bun';
import { Database } from 'bun:sqlite';
import { server } from 'typescript';

const clients = new Set<WebSocket>();

// reusable broadcast
function broadcast(data: string) {
  for (const client of clients) {
    client.send(data);
  }
}

process.on('SIGINT', () => {
  server.close(() => {
    shutDownDb();
  });
});

serve({
  port: 3000,

  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === '/ws') {
      if (server.upgrade(req)) return;
      return new Response('Upgrade failed', { status: 400 });
    }

    if (url.pathname === '/') {
      return new Response(Bun.file('./index.html'), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },

  websocket: {
    open(ws) {
      db.run('INSERT INTO visitors(count , time)');
      clients.add(ws);

      const numClients = clients.size;
      console.log('Clients connected:', numClients);

      broadcast(`Current visitors: ${numClients}`);
    },

    message(ws, message) {
      console.log('Received:', message);

      broadcast(`Echo: ${message}`);
    },

    close(ws) {
      clients.delete(ws);

      const numClients = clients.size;
      console.log('Client disconnected:', numClients);

      broadcast(`Current visitors: ${numClients}`);
    },
  },
});

/**
 * Database setup (Bun SQLite)
 */

const db = new Database(':memory:');

// Create table (no serialize, direct execution)
db.run(`
  CREATE TABLE IF NOT EXISTS visitors (
    count INTEGER,
    time TEXT
  )
`);

// Insert example row (optional)
db.run('INSERT INTO visitors (count, time) VALUES (?, ?)', [
  1,
  new Date().toISOString(),
]);

// Query function
function getCounts() {
  const stmt = db.query('SELECT * FROM visitors');
  const rows = stmt.all();

  console.log(rows);
}

// Call it to test
getCounts();
function shutDownDb() {
  getCounts();
  console.log('Shutting down db');
  db.close;
}

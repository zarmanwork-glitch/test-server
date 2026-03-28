import { serve } from 'bun';

const clients = new Set();

// 👇 reusable broadcast
function broadcast(data: string) {
  for (const client of clients) {
    client.send(data);
  }
}

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
      clients.add(ws);

      const numClients = clients.size;
      console.log('Clients connected:', numClients);

      // 👇 use broadcast
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

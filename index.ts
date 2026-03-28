// server.js
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello from Bun server!");
  },
});

console.log("Server running on http://localhost:3000");

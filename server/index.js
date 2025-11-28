// index.js - raw Node.js HTTP server
require('dotenv').config();
const http = require('http');
const { parse } = require('url');
const { StringDecoder } = require('string_decoder');
const { db, init } = require('./db');

const PORT = process.env.PORT || 3000;

init(); // ensure tables exist

// tiny helper to send JSON responses
function sendJson(res, status, obj) {
  const payload = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(payload);
}

// parse body helper
function parseBody(req) {
  return new Promise((resolve, reject) => {
    const decoder = new StringDecoder('utf8');
    let buffer = '';
    req.on('data', (chunk) => (buffer += decoder.write(chunk)));
    req.on('end', () => {
      buffer += decoder.end();
      if (!buffer) return resolve(null);
      try {
        resolve(JSON.parse(buffer));
      } catch (e) {
        reject(e);
      }
    });
  });
}

// Basic Router
const server = http.createServer(async (req, res) => {
  const parsed = parse(req.url, true);
  const path = parsed.pathname.replace(/^\/+|\/+$/g, '');
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // Routes:
  // GET /api/projects
  // POST /api/projects
  // GET /api/projects/:id/tasks
  // POST /api/projects/:id/tasks
  // PUT /api/tasks/:id  (toggle / update)
  // DELETE /api/tasks/:id

  try {
    if (path === 'api/projects' && method === 'GET') {
      db.all('SELECT * FROM projects ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return sendJson(res, 500, { error: err.message });
        sendJson(res, 200, { data: rows });
      });
      return;
    }

    if (path === 'api/projects' && method === 'POST') {
      const body = await parseBody(req);
      if (!body || !body.name) return sendJson(res, 400, { error: 'name required' });
      db.run('INSERT INTO projects (name, description) VALUES (?, ?)', [body.name, body.description || null], function (err) {
        if (err) return sendJson(res, 500, { error: err.message });
        db.get('SELECT * FROM projects WHERE id = ?', [this.lastID], (e, row) => {
          if (e) return sendJson(res, 500, { error: e.message });
          sendJson(res, 201, { data: row });
        });
      });
      return;
    }

    // GET tasks for project
    const projTasksMatch = path.match(/^api\/projects\/(\d+)\/tasks$/);
    if (projTasksMatch && method === 'GET') {
      const projectId = projTasksMatch[1];
      db.all('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC', [projectId], (err, rows) => {
        if (err) return sendJson(res, 500, { error: err.message });
        sendJson(res, 200, { data: rows });
      });
      return;
    }

    // POST task
    if (projTasksMatch && method === 'POST') {
      const projectId = projTasksMatch[1];
      const body = await parseBody(req);
      if (!body || !body.title) return sendJson(res, 400, { error: 'title required' });
      db.run('INSERT INTO tasks (project_id, title) VALUES (?, ?)', [projectId, body.title], function (err) {
        if (err) return sendJson(res, 500, { error: err.message });
        db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (e, row) => {
          if (e) return sendJson(res, 500, { error: e.message });
          sendJson(res, 201, { data: row });
        });
      });
      return;
    }

    // PUT /api/tasks/:id
    const taskUpdateMatch = path.match(/^api\/tasks\/(\d+)$/);
    if (taskUpdateMatch && method === 'PUT') {
      const id = taskUpdateMatch[1];
      const body = await parseBody(req);
      const done = body && typeof body.done === 'boolean' ? (body.done ? 1 : 0) : null;
      const title = body && body.title ? body.title : null;
      const sets = [];
      const params = [];
      if (done !== null) {
        sets.push('done = ?'); params.push(done);
      }
      if (title !== null) {
        sets.push('title = ?'); params.push(title);
      }
      if (sets.length === 0) return sendJson(res, 400, { error: 'nothing to update' });
      params.push(id);
      const sql = `UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`;
      db.run(sql, params, function (err) {
        if (err) return sendJson(res, 500, { error: err.message });
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (e, row) => {
          if (e) return sendJson(res, 500, { error: e.message });
          sendJson(res, 200, { data: row });
        });
      });
      return;
    }

    // DELETE /api/tasks/:id
    if (taskUpdateMatch && method === 'DELETE') {
      const id = taskUpdateMatch[1];
      db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
        if (err) return sendJson(res, 500, { error: err.message });
        sendJson(res, 200, { data: { id: Number(id) }});
      });
      return;
    }

    // fallback
    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

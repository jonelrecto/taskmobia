#!/usr/bin/env node
/**
 * API smoke test — validates Authentication and Project REST endpoints.
 * Run: node scripts/test-api.js
 */

const BASE_AUTH = 'http://localhost:5001/auth';
const BASE_PROJECTS = 'http://localhost:5001/projects';

let passed = 0;
let failed = 0;

async function req(method, url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json();
  return { status: res.status, data };
}

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

async function run() {
  console.log('\n🧪 Client Project Tracker — API & Auth Test Suite\n');

  // ── AUTH: Login with Demo User ──────────────────────────────────────────────
  console.log('POST /auth/login (Demo user)');
  let r = await req('POST', `${BASE_AUTH}/login`, {
    email: 'admin@projectflow.io',
    password: 'password123',
  });
  assert('returns 200', r.status === 200);
  assert('returns token', typeof r.data.token === 'string');
  assert('returns user details', r.data.user?.email === 'admin@projectflow.io');
  const token = r.data.token;

  console.log('\nPOST /auth/login (Invalid credentials)');
  r = await req('POST', `${BASE_AUTH}/login`, {
    email: 'admin@projectflow.io',
    password: 'wrongpassword',
  });
  assert('returns 401', r.status === 401);

  // ── AUTH: Register New User ────────────────────────────────────────────────
  const testEmail = `newuser_${Date.now()}@example.com`;
  console.log('\nPOST /auth/register');
  r = await req('POST', `${BASE_AUTH}/register`, {
    name: 'New Developer',
    email: testEmail,
    password: 'securepassword123',
  });
  assert('returns 201', r.status === 201);
  assert('returns token', typeof r.data.token === 'string');
  assert('returns user name', r.data.user?.name === 'New Developer');

  // ── AUTH: GET /auth/me ─────────────────────────────────────────────────────
  console.log('\nGET /auth/me (Protected auth route)');
  r = await req('GET', `${BASE_AUTH}/me`, null, token);
  assert('returns 200', r.status === 200);
  assert('returns correct user name', r.data.name === 'Admin User');

  // ── PROJECTS: Protected route without token ────────────────────────────────
  console.log('\nGET /projects (Without auth token)');
  r = await req('GET', BASE_PROJECTS);
  assert('returns 401 Unauthorized', r.status === 401);

  // ── PROJECTS: GET /projects with token ─────────────────────────────────────
  console.log('\nGET /projects (With valid auth token)');
  r = await req('GET', BASE_PROJECTS, null, token);
  assert('returns 200', r.status === 200);
  assert('returns array', Array.isArray(r.data));
  assert('contains seeded projects', r.data.length >= 12);

  // ── PROJECTS: Priority Filter & Sort ───────────────────────────────────────
  console.log('\nGET /projects?priority=High');
  r = await req('GET', `${BASE_PROJECTS}?priority=High`, null, token);
  assert('returns 200', r.status === 200);
  assert('all returned projects have High priority', r.data.every((p) => p.priority === 'High'));

  console.log('\nGET /projects?sortBy=priority&sortOrder=desc');
  r = await req('GET', `${BASE_PROJECTS}?sortBy=priority&sortOrder=desc`, null, token);
  assert('returns 200', r.status === 200);
  assert('first item is High priority', r.data[0]?.priority === 'High');
  assert('custom rank order High -> Medium -> Low respected', () => {
    const ranks = { High: 1, Medium: 2, Low: 3 };
    for (let i = 0; i < r.data.length - 1; i++) {
      if (ranks[r.data[i].priority] > ranks[r.data[i + 1].priority]) return false;
    }
    return true;
  });

  // ── PROJECTS: Stats ────────────────────────────────────────────────────────
  console.log('\nGET /projects/stats');
  r = await req('GET', `${BASE_PROJECTS}/stats`, null, token);
  assert('returns 200', r.status === 200);
  assert('returns overall database stats object', typeof r.data.total === 'number' && typeof r.data.inProgress === 'number');

  // ── PROJECTS: Pagination ───────────────────────────────────────────────────
  console.log('\nGET /projects?page=1&limit=6');
  r = await req('GET', `${BASE_PROJECTS}?page=1&limit=6`, null, token);
  assert('returns 200', r.status === 200);
  assert('returns paginated data array of length 6', Array.isArray(r.data.data) && r.data.data.length === 6);
  assert('returns pagination envelope metadata', r.data.pagination?.page === 1 && r.data.pagination?.limit === 6);
  assert('hasNextPage is true', r.data.pagination?.hasNextPage === true);
  console.log('\nPOST /projects (valid)');
  const payload = {
    clientName: 'Auth Test Client',
    projectName: 'Auth Test Project',
    description: 'Created by auth test suite',
    status: 'Planning',
    priority: 'High',
    startDate: '2026-07-01',
    dueDate: '2026-08-01',
  };
  r = await req('POST', BASE_PROJECTS, payload, token);
  assert('returns 201', r.status === 201);
  assert('has id', r.data.id > 0);
  const newId = r.data.id;

  // ── PROJECTS: DELETE /projects/:id ─────────────────────────────────────────
  console.log(`\nDELETE /projects/${newId}`);
  r = await req('DELETE', `${BASE_PROJECTS}/${newId}`, null, token);
  assert('returns 200', r.status === 200);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`\n─────────────────────────────────────`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('\n💥 Test runner crashed:', err.message);
  process.exit(1);
});

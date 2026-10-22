const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { test } = require('node:test');

const seedPath = path.join(__dirname, '../scripts/seed.js');
// Run the real CLI entry point in a child process to check its exit status.
const bootstrap = `
  const Module = require('node:module');
  const originalRequire = Module.prototype.require;
  const failure = process.argv[2];
  const stages = [];
  const diagnostics = [];
  let closed = false;
  console.log = () => {};
  console.error = (...args) => diagnostics.push(String(args[0]));
  const client = {
    async sql(strings) {
      const table = strings.join('').match(/CREATE TABLE IF NOT EXISTS (\\w+)/)?.[1];
      if (table) {
        stages.push(table);
        if (failure === table) throw new Error('Simulated seed failure');
      }
      return { rows: [] };
    },
    async end() {
      await new Promise((resolve) => setTimeout(resolve, 5));
      if (failure === 'close') throw new Error('Simulated close failure');
      closed = true;
    },
  };
  Module.prototype.require = function (name) {
    if (name === '@vercel/postgres') return {
      db: {
        async connect() {
          if (failure === 'connect') throw new Error('Simulated connection failure');
          return client;
        },
      },
    };
    if (name === 'bcrypt') return { hash: async () => 'hashed-password' };
    return originalRequire.apply(this, arguments);
  };
  process.on('exit', (code) => {
    process.stdout.write(JSON.stringify({ code, closed, stages, diagnostics }));
  });
  require(process.argv[1]);
`;

function runSeed(failure = '') {
  const result = spawnSync(
    process.execPath,
    ['-e', bootstrap, seedPath, failure],
    {
      encoding: 'utf8',
      timeout: 5000,
    },
  );
  assert.ifError(result.error);
  return { status: result.status, ...JSON.parse(result.stdout) };
}

test('a successful seed closes its client and exits successfully', () => {
  const result = runSeed();
  assert.equal(result.status, 0);
  assert.equal(result.closed, true);
  assert.deepEqual(result.stages, [
    'users',
    'customers',
    'invoices',
    'revenue',
  ]);
  assert.deepEqual(result.diagnostics, []);
});

test('a connection failure exits unsuccessfully', () => {
  const result = runSeed('connect');
  assert.equal(result.status, 1);
  assert.equal(result.closed, false);
  assert.deepEqual(result.stages, []);
  assert.equal(result.diagnostics.length, 1);
});

const tables = ['users', 'customers', 'invoices', 'revenue'];
for (const [index, table] of tables.entries()) {
  test(`a failure seeding ${table} closes the client and exits unsuccessfully`, () => {
    const result = runSeed(table);
    assert.equal(result.status, 1);
    assert.equal(result.closed, true);
    assert.deepEqual(result.stages, tables.slice(0, index + 1));
    assert.ok(result.diagnostics.length > 0);
  });
}

test('a failure closing the client exits unsuccessfully', () => {
  const result = runSeed('close');
  assert.equal(result.status, 1);
  assert.equal(result.diagnostics.length, 1);
});

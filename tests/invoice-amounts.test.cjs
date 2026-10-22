const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');

// Load the actual actions without a Next.js server or database connection.
const filename = path.join(__dirname, '../app/lib/actions.ts');
const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});

function loadActions() {
  const writes = [];
  const revalidated = [];
  const redirected = new Error('redirect');
  const actions = {};
  const dependencies = {
    'next/cache': { revalidatePath: (url) => revalidated.push(url) },
    'next/navigation': {
      redirect(url) {
        assert.equal(url, '/dashboard/invoices');
        throw redirected;
      },
    },
    '@vercel/postgres': {
      async sql(strings, ...values) {
        writes.push({ query: strings.join('?'), values });
        return { rows: [] };
      },
    },
    '@/auth': {},
    zod: require('zod'),
  };
  runInNewContext(
    outputText,
    {
      exports: actions,
      require(name) {
        assert.ok(
          Object.hasOwn(dependencies, name),
          `Unexpected import: ${name}`,
        );
        return dependencies[name];
      },
    },
    { filename },
  );
  return { actions, writes, revalidated, redirected };
}

for (const actionName of ['createInvoice', 'updateInvoice']) {
  for (const [amount, cents] of [
    ['0.07', 7],
    ['0.29', 29],
    ['1.10', 110],
    ['19.99', 1999],
    ['100.00', 10000],
  ]) {
    test(`${actionName} stores $${amount} as ${cents} integer cents`, async () => {
      const { actions, writes, revalidated, redirected } = loadActions();
      const formData = new FormData();
      formData.set('customerId', '3958dc9e-712f-4377-85e9-fec4b6a6442a');
      formData.set('amount', amount);
      formData.set('status', 'pending');
      const args =
        actionName === 'updateInvoice'
          ? ['invoice-id', {}, formData]
          : [{}, formData];

      await assert.rejects(
        actions[actionName](...args),
        (error) => error === redirected,
      );

      assert.equal(writes.length, 1);
      assert.equal(writes[0].values[1], cents, `${actionName}: $${amount}`);
      assert.deepEqual(revalidated, ['/dashboard/invoices']);
    });
  }
}

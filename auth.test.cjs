const test = require('node:test');
const assert = require('node:assert/strict');
const state = require('./auth.js');

test('forwards only the one-time PKCE code to the fixed app callback', () => {
  assert.deepEqual(state('?code=abc-123&redirect_to=https://evil.example', ''), {
    kind: 'confirmed', url: 'brewit://confirm-email?code=abc-123'
  });
});
test('does not claim confirmation for missing or malformed codes', () => {
  for (const query of ['', '?code=', '?code=a&code=b', '?code=%3Cscript%3E', '?code=a%0Ab']) {
    assert.equal(state(query, '').kind, 'missing');
  }
});
test('errors take priority over a code without reflecting supplied text', () => {
  assert.deepEqual(state('?code=abc&error_description=unsafe', ''), { kind: 'error' });
  assert.deepEqual(state('', '#error_code=otp_expired'), { kind: 'error' });
});
test('legacy confirmation never forwards bearer credentials', () => {
  assert.deepEqual(state('', '#type=signup&access_token=secret&refresh_token=secret'), { kind: 'manual' });
  assert.deepEqual(state('?code=abc', '#access_token=secret'), { kind: 'missing' });
  assert.deepEqual(state('', '#type=recovery&access_token=secret'), { kind: 'missing' });
});

(async () => {
  try {
    const base = 'http://localhost:5000';
    const email = `smoke+${Date.now()}@example.com`;
    const password = 'Password123!';

    console.log('REGISTER: sending', { name: 'Smoke Test', email, password });
    let res = await fetch(base + '/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Smoke Test', email, password })
    });
    const regBody = await res.json().catch(() => null);
    console.log('REGISTER status', res.status, 'body', JSON.stringify(regBody));

    console.log('\nLOGIN: sending', { email, password });
    res = await fetch(base + '/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginBody = await res.json().catch(() => null);
    console.log('LOGIN status', res.status, 'body', JSON.stringify(loginBody));

    const token = loginBody?.token;
    if (!token) {
      console.error('\nNo token received; aborting note creation.');
      process.exit(1);
    }

    console.log('\nCREATE NOTE: sending with Authorization Bearer token');
    res = await fetch(base + '/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: 'Smoke note', content: 'This is a smoke test', tags: ['smoke'] })
    });
    const noteBody = await res.json().catch(() => null);
    console.log('CREATE NOTE status', res.status, 'body', JSON.stringify(noteBody));

    // Print consolidated JSON for easy copying
    console.log('\n=== SUMMARY JSON RESPONSES ===');
    console.log(JSON.stringify({ register: regBody, login: loginBody, createNote: noteBody }, null, 2));
  } catch (err) {
    console.error('Smoke test error:', err);
    process.exit(1);
  }
})();

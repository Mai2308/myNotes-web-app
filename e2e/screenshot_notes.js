const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const fs = require('fs');

(async () => {
  try {
    const base = 'http://localhost:5000';
    const apiRegister = base + '/api/users/register';
    const apiLogin = base + '/api/users/login';

    const email = `e2e+${Date.now()}@example.com`;
    const password = 'Password123!';

    console.log('Registering user', email);
    await fetch(apiRegister, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: 'E2E User', email, password })});

    console.log('Logging in');
    const loginRes = await fetch(apiLogin, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password })});
    const loginJson = await loginRes.json();
    const token = loginJson.token;
    if (!token) throw new Error('No token from login');

    console.log('Launching headless browser');
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    // Determine frontend URL (allow override via FRONTEND_URL env var)
    const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Navigate to the app root so the client app loads
    await page.goto(FRONTEND + '/login', { waitUntil: 'networkidle2' });

    // Inject token into localStorage and navigate to /notes
    await page.evaluate((t) => {
      localStorage.setItem('token', t);
    }, token);

    await page.goto(FRONTEND + '/notes', { waitUntil: 'networkidle2' });

    // Wait a short moment for the notes to render
    await new Promise((r) => setTimeout(r, 1000));

    const outPath = 'e2e/notes.png';
    await page.screenshot({ path: outPath, fullPage: true });
    console.log('Saved screenshot to', outPath);

    await browser.close();
  } catch (err) {
    console.error('E2E error:', err);
    process.exit(1);
  }
})();

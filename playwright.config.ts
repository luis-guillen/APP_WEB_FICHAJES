import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1, // To avoid DB concurrency locks
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:8080',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: [
        {
            command: 'cd backend && source venv/bin/activate && PYTHONPATH=. python tests/e2e_server.py',
            port: 8000,
            reuseExistingServer: !process.env.CI,
            stdout: 'pipe',
        },
        {
            command: 'npm run dev',
            port: 8080,
            reuseExistingServer: !process.env.CI,
            stdout: 'pipe',
        }
    ],
});

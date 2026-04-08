import { test, expect } from '@playwright/test';

const suffix = Date.now().toString().slice(-6);

test.describe('E2E Golden Paths for Time Flow', () => {

    test('Admin Workflow: Login, Create User, Create Project, Assign User', async ({ page }) => {
        // 1. Admin Login
        await page.goto('/');
        await page.click('button:has-text("Administrador")');
        await page.fill('input[placeholder="Contraseña"]', 'admin123');
        await page.click('button:has-text("Iniciar Sesión")');

        await expect(page.locator('h1:has-text("Panel de Administración")')).toBeVisible();

        // 2. Create a User
        await page.click('a[href="/admin/users"]');
        await page.click('button:has-text("Añadir Usuario")');

        // Modal opens
        await expect(page.locator('h2:has-text("Crear Usuario")')).toBeVisible();

        const userCode = `E2E-${suffix}`;

        // Form Filling
        const inputs = page.locator('div[role="dialog"] >> input');
        await inputs.nth(0).fill(userCode);
        await inputs.nth(1).fill(`E2E Test User ${suffix}`);
        await inputs.nth(2).fill('Madrid');

        // Radix Select
        await page.click('button[role="combobox"]');
        await page.click('div[role="option"]:has-text("Ingenieros Mecánicos")');

        await inputs.nth(3).fill('test1234');

        // Submit
        await page.click('div[role="dialog"] >> button:has-text("Crear Usuario")');

        // 3. Create a Project
        await page.click('a[href="/admin/projects"]');
        await page.click('button:has-text("Añadir Proyecto")');

        await expect(page.locator('h2:has-text("Crear Proyecto")')).toBeVisible();

        const projectCode = `PRJ-${suffix}`;
        const projectInputs = page.locator('div[role="dialog"] >> input');

        await projectInputs.nth(0).fill(`E2E Project ${suffix}`);
        await projectInputs.nth(1).fill(projectCode);
        await projectInputs.nth(2).fill('Facility A');
        await projectInputs.nth(3).fill('0');
        // Date input:
        await projectInputs.nth(4).fill('2025-01-01');

        // Standard Project Select
        await page.click('button[role="combobox"]');
        await page.click('div[role="option"]:has-text("Estándar")');

        // Assign to all users so the Employee workflow has access to it
        await page.click('label:has-text("Asignar a todos los usuarios")');

        await page.click('div[role="dialog"] >> button:has-text("Crear Proyecto")');

        // Expected visible project text
        await expect(page.locator(`td:has-text("${projectCode}")`)).toBeVisible({ timeout: 10000 });
    });

    test('User Workflow: Login, Log Hours, Check Dashboard', async ({ page }) => {
        // 1. Empleado Login
        await page.goto('/');

        // "Empleado" tab active by default
        const userCode = `E2E-${suffix}`;
        await page.fill('input[placeholder="Nombre"]', userCode);
        await page.fill('input[placeholder="Contraseña"]', 'test1234');
        await page.click('button:has-text("Iniciar Sesión")');

        await expect(page.locator('h1:has-text("Registrar Horas")')).toBeVisible({ timeout: 10000 });

        // Step 1: Project
        await page.click('button[role="combobox"]');
        await page.click('div[role="option"]:has-text("PRJ-")');
        await page.click('button:has-text("Siguiente")');

        // Step 2: Role
        await page.click('button[role="combobox"]');
        await page.click('div[role="option"]:has-text("Ingenieros Mecánicos")');
        await page.click('button:has-text("Siguiente")');

        // Step 3: Date (Leave default)
        await page.click('button:has-text("Siguiente")');

        // Step 4: Holiday (Leave false)
        await page.click('button:has-text("Siguiente")');

        // Step 5: Task
        await page.click('button[role="combobox"]');
        await page.click('div[role="option"]:has-text("111")');
        await page.click('button:has-text("Siguiente")');

        // Step 6: Hours
        await page.fill('input[type="number"]', '4');
        await page.click('button:has-text("Siguiente")');

        // Step 7: Overtime
        await page.click('button:has-text("Enviar")');

        // Wait for Success Sonner Toast
        await expect(page.locator('text=Horas registradas correctamente')).toBeVisible({ timeout: 10000 });
    });
});

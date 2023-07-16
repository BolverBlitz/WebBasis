const setup = require('@playwright/test').test;
const config = require('./config.json');

const delay = ms => new Promise(res => setTimeout(res, ms));

// Path: tests\auth.setup.js

const authFile = '.auth/admin.json';

setup('Login', async ({ page }) => {
    page.context().locale = 'en-US';
    await page.goto('http://localhost/');
    await page.getByText('Login').click();
    await page.locator('#username').click();
    await page.locator('#username').fill(config.TestAdmin.username);
    await page.locator('label').filter({ hasText: 'Username' }).getByRole('button').click();
    await page.locator('#password').click();
    await page.locator('#password').fill(config.TestAdmin.password);
    await page.locator('label').filter({ hasText: 'Password' }).getByRole('button').click();

    await page.waitForLoadState('load');

    await delay(5000);

    await page.goto('http://localhost/');
    await page.waitForLoadState('load');
    

    await page.context().storageState({ path: authFile });
});
const { When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");

/**
 * Opens Mailinator public inbox and extracts temp password.
 * Email text (from your screenshot):
 * "Your temporary password is D8JHqYjZ"
 */
async function getTempPasswordFromMailinator(page, inboxName) {
    console.log(`Opening Mailinator inbox: ${inboxName}`);

    // Try to navigate to Mailinator with retries
    const maxRetries = 3;
    let loaded = false;

    for (let i = 0; i < maxRetries; i++) {
        try {
            await page.goto(
                `https://www.mailinator.com/v4/public/inboxes.jsp?to=${encodeURIComponent(inboxName)}`,
                { waitUntil: "domcontentloaded", timeout: 60000 }
            );
            loaded = true;
            break;
        } catch (e) {
            console.log(`Navigation attempt ${i + 1} failed, retrying...`);
            if (i === maxRetries - 1) throw e;
            await page.waitForTimeout(2000);
        }
    }

    if (!loaded) {
        throw new Error("Failed to load Mailinator inbox page");
    }

    const subjectRegex = /welcome to chekku/i;

    // ✅ 1) Wait for the email row to appear (poll by reloading, but no repeated logs)
    const start = Date.now();
    const MAX_WAIT = 6 * 60 * 1000;      // 6 minutes
    const POLL_INTERVAL = 10 * 1000;     // 10 seconds

    console.log("Waiting for email...");

    let rowFound = false;
    let attempts = 0;
    while (Date.now() - start < MAX_WAIT) {
        attempts++;

        // Try multiple ways to find the email row
        let row = page.locator("tr").filter({ hasText: subjectRegex }).first();

        // If not found, try finding any row containing "chekku" (case insensitive)
        if (!(await row.count())) {
            row = page.locator("tr").filter({ hasText: /chekku/i }).first();
        }

        // If still not found, try finding any email row
        if (!(await row.count())) {
            row = page.locator("table tbody tr").first();
        }

        const rowCount = await row.count();

        if (rowCount > 0) {
            console.log(`Email found after ${attempts} attempts (${Math.round((Date.now() - start) / 1000)}s)`);
            rowFound = true;
            await row.click();
            break;
        }

        // Log progress every 30 seconds
        if (attempts % 3 === 0) {
            const elapsed = Math.round((Date.now() - start) / 1000);
            console.log(`Still waiting... ${elapsed}s elapsed, ${Math.round((MAX_WAIT - (Date.now() - start)) / 1000)}s remaining`);
        }

        await page.waitForTimeout(POLL_INTERVAL);
        await page.reload({ waitUntil: "domcontentloaded" });
    }

    if (!rowFound) {
        // Take screenshot for debugging
        const debugPath = `./reports/mailinator-debug-${Date.now()}.png`;
        await page.screenshot({ path: debugPath, fullPage: true });
        throw new Error(`Email did not arrive within ${MAX_WAIT / 60000} minutes. Screenshot saved to ${debugPath}`);
    }

    console.log("Email arrived. Opening and extracting password...");

    // Wait for the email to fully load
    await page.waitForTimeout(5000);

    // Debug: List all iframes on the page
    const iframeInfo = await page.evaluate(() => {
        const iframes = Array.from(document.querySelectorAll('iframe'));
        return iframes.map(iframe => ({
            id: iframe.id,
            name: iframe.name,
            src: iframe.src?.substring(0, 100),
            width: iframe.width,
            height: iframe.height
        }));
    });
    console.log("Found iframes:", JSON.stringify(iframeInfo, null, 2));

    // ✅ 2) Wait for email body to be ready and contain the password text
    // Try different iframe selectors
    let body = null;
    let bodyText = "";
    const iframeSelectors = [
        "iframe#html_msg_body",
        "iframe[name='html_msg_body']",
        "iframe#texthtml_msg_body",
        "iframe[name='texthtml_msg_body']",
        "iframe#msg_body",
        "iframe#iframeMail"
    ];

    for (const selector of iframeSelectors) {
        try {
            console.log(`Trying iframe selector: ${selector}`);
            const frame = page.frameLocator(selector);
            const frameBody = frame.locator("body");

            // Wait for body to be attached
            await frameBody.waitFor({ state: "attached", timeout: 10000 });

            // Wait for content to load - try to get text with retry
            let hasContent = false;
            for (let i = 0; i < 10; i++) {
                bodyText = await frameBody.innerText().catch(() => "");
                if (bodyText.trim().length > 0) {
                    hasContent = true;
                    break;
                }
                await page.waitForTimeout(1000);
            }

            if (hasContent) {
                console.log(`Found content in iframe: ${selector}`);
                body = frameBody;
                break;
            }
        } catch (e) {
            console.log(`Failed with ${selector}: ${e.message}`);
            continue;
        }
    }

    if (!body || !bodyText) {
        // Take screenshot for debugging
        const debugPath = `./reports/mailinator-iframe-debug-${Date.now()}.png`;
        await page.screenshot({ path: debugPath, fullPage: true });
        throw new Error(`Could not locate email body iframe with content. Screenshot: ${debugPath}`);
    }

    console.log(`Email body text: ${bodyText.substring(0, 200)}...`);

    const match = bodyText.match(/Your temporary password is\s+([A-Za-z0-9]{6,})/i);
    if (!match) {
        // Take screenshot for debugging
        const debugPath = `./reports/mailinator-password-debug-${Date.now()}.png`;
        await page.screenshot({ path: debugPath, fullPage: true });
        throw new Error(`Password text not found in email body. Screenshot: ${debugPath}\n\nBODY:\n${bodyText}`);
    }

    console.log("Temporary password extracted.");
    return match[1];
}

When(
    "I open the Mailinator inbox and read the temporary password",
    { timeout: 8 * 60 * 1000 }, // 8 minutes to allow for email delays
    async function () {
        const emailPage = await this.context.newPage();
        try {
            this.tempPassword = await getTempPasswordFromMailinator(emailPage, this.mailInbox);
        } finally {
            await emailPage.close().catch(() => {});
        }
    }
);

When("I navigate to the Sign In page", async function () {
    // Preferred: direct URL (stable)
    await this.page.goto(`${process.env.BASE_URL}/login`, { waitUntil: "domcontentloaded" });
});

When("I login with the Mailinator email and temporary password", async function () {
    if (!this.mailEmail) throw new Error("mailEmail is missing.");
    if (!this.tempPassword) throw new Error("tempPassword is missing.");

    // If you already have LoginPage object, replace below with:
    // await this.loginPage.login(this.mailEmail, this.tempPassword);

    // Direct locator approach (update selectors if your login page differs)
    await this.page.locator("#id_email").fill(this.mailEmail);

    // Common password ids: #id_password, #id_password1 etc.
    const passwordInput =
        this.page.locator("#id_password").first();

    await passwordInput.fill(this.tempPassword);

    await this.page.getByRole("button", { name: /sign in|login/i }).click();
});

When('I login with the Mailinator email and password {string}', async function (password) {
    if (!this.mailEmail) throw new Error("mailEmail is missing.");

    await this.page.locator("#id_email").fill(this.mailEmail);
    await this.page.locator("#id_password").fill(password);
    await this.page.getByRole("button", { name: /sign in|login/i }).click();
});

Then('I should see the {string} page', async function (title) {
    await expect(this.page.getByText(new RegExp(title, "i"))).toBeVisible({ timeout: 15000 });
});
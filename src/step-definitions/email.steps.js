const { When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");

/**
 * Opens Mailinator public inbox and extracts temp password.
 * Email text (from your screenshot):
 * "Your temporary password is D8JHqYjZ"
 */
async function getTempPasswordFromMailinator(page, inboxName) {
    console.log(`Opening Mailinator inbox: ${inboxName}`);

    await page.goto(
        `https://www.mailinator.com/v4/public/inboxes.jsp?to=${encodeURIComponent(inboxName)}`,
        { waitUntil: "domcontentloaded" }
    );

    // 1️⃣ Find the email row container (proper div/container detection)
    const emailRow = page
        .locator('tr[id^="row_"] td:nth-child(2)')
        .filter({ hasText: /Welcome to Chekku/i })
        .first();

    console.log("Waiting for email (up to 6 minutes)...");

    try {
        await expect(emailRow).toBeVisible({ timeout: 6 * 60 * 1000 }); // 6 minutes
    } catch (e) {
        // Fallback: try finding any row (maybe subject is different)
        console.log("Trying fallback selector for any email row...");
        const anyRow = page.locator('tr[id^="row_"]').first();
        await expect(anyRow).toBeVisible({ timeout: 30000 });
        await anyRow.click();
        console.log("Opened first available email");
        // Continue to password extraction
        const frame = page.frameLocator("iframe#html_msg_body, iframe[name='html_msg_body'], iframe#iframeMail, iframe").first();
        const body = frame.locator("body");
        await expect(body).toContainText(/Your temporary password is/i, { timeout: 60_000 });
        const bodyText = await body.innerText();
        const match = bodyText.match(/Your temporary password is\s+([A-Za-z0-9]{6,})/i);
        if (!match) {
            throw new Error(`Temporary password not found.\n\n${bodyText}`);
        }
        console.log("Temporary password extracted successfully");
        return match[1];
    }

    await emailRow.click();

    console.log("Email opened, extracting password...");

    // 2️⃣ Switch to email body container (iframe)
    const frame = page.frameLocator("iframe#html_msg_body, iframe[name='html_msg_body'], iframe#iframeMail, iframe").first();
    const body = frame.locator("body");

    // 3️⃣ Wait for password text to appear in the body
    await expect(body).toContainText(/Your temporary password is/i, {
        timeout: 60_000,
    });

    const bodyText = await body.innerText();

    // 4️⃣ Extract password
    const match = bodyText.match(
        /Your temporary password is\s+([A-Za-z0-9]{6,})/i
    );

    if (!match) {
        throw new Error(`Temporary password not found.\n\n${bodyText}`);
    }

    console.log("Temporary password extracted successfully");
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
    // Navigate to the correct login page
    await this.page.goto(`${process.env.BASE_URL}/login`, { waitUntil: "domcontentloaded" });

    // Debug: log the current URL to verify we're on the right page
    console.log("Current URL after navigation:", this.page.url());

    // Wait for page to stabilize
    await this.page.waitForTimeout(500);
});

When("I login with the Mailinator email and temporary password", async function () {
    if (!this.mailEmail) throw new Error("mailEmail is missing.");
    if (!this.tempPassword) throw new Error("tempPassword is missing.");

    console.log("Current URL before login:", this.page.url());
    console.log("Attempting login with email:", this.mailEmail);

    // Use flexible selectors with fallbacks
    const emailInput = this.page.locator("#id_email, input[name='email'], input[type='email']").first();
    const passwordInput = this.page.locator("#id_password, input[name='password'], input[type='password']").first();

    // Wait for email field and fill
    await emailInput.waitFor({ state: "visible", timeout: 30000 });
    await emailInput.fill(this.mailEmail);

    // Wait for password field and fill
    await passwordInput.waitFor({ state: "visible", timeout: 30000 });
    await passwordInput.fill(this.tempPassword);

    // Click login button
    await this.page.getByRole("button", { name: /sign in|login/i }).click();

    console.log("Login submitted, waiting for navigation...");
});

When('I login with the Mailinator email and password {string}', async function (password) {
    if (!this.mailEmail) throw new Error("mailEmail is missing.");

    await this.page.locator("#id_email").fill(this.mailEmail);
    await this.page.locator("#id_password").fill(password);
    await this.page.getByRole("button", { name: /sign in|login/i }).click();
});

Then('I should see the {string} page', async function (title) {
    console.log("Current URL after login:", this.page.url());

    // For "Change your password !" page, check URL instead of text (more stable)
    if (title.toLowerCase().includes("change") && title.toLowerCase().includes("password")) {
        await expect(this.page).toHaveURL(/\/register\/reset/i, { timeout: 30000 });
        console.log("Successfully reached password change page");
    } else {
        // Fallback to text check for other pages
        await expect(this.page.getByText(new RegExp(title, "i"))).toBeVisible({ timeout: 15000 });
    }
});
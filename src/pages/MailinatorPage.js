const { expect } = require("@playwright/test");

class MailinatorPage {
    constructor(page) {
        this.page = page;
    }

    async openInbox(inboxName) {
        await this.page.goto(
            `https://www.mailinator.com/v4/public/inboxes.jsp?to=${encodeURIComponent(inboxName)}`,
            { waitUntil: "domcontentloaded" }
        );
    }

    async waitAndOpenTempPasswordEmail() {
        // Match your email subject (from screenshot)
        const subjectRegex = /Welcome to Chekku/i;

        const MAX_ATTEMPTS = 36; // 36 * 10s = 6 minutes
        const POLL_INTERVAL = 10000; // 10 seconds

        console.log("Waiting for 'Welcome to Chekku' email...");

        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            // Try multiple ways to find the email
            let row = this.page.locator("tr").filter({ hasText: subjectRegex }).first();

            // Fallback: try any row with "chekku"
            if (!(await row.count())) {
                row = this.page.locator("tr").filter({ hasText: /chekku/i }).first();
            }

            if (await row.count()) {
                console.log(`Email found after ${i + 1} attempts (${(i + 1) * 10}s)`);
                await row.click();
                return;
            }

            // Log progress every 3 attempts (30 seconds)
            if ((i + 1) % 3 === 0) {
                console.log(`Still waiting... attempt ${i + 1}/${MAX_ATTEMPTS}`);
            }

            await this.page.waitForTimeout(POLL_INTERVAL);
            await this.page.reload({ waitUntil: "domcontentloaded" });
        }

        // Take screenshot for debugging
        const debugPath = `./reports/mailinator-debug-${Date.now()}.png`;
        await this.page.screenshot({ path: debugPath, fullPage: true });
        throw new Error(`Temp password email did not arrive in Mailinator inbox after ${MAX_ATTEMPTS * POLL_INTERVAL / 60000} minutes. Screenshot: ${debugPath}`);
    }

    async extractTempPassword() {
        // Wait for email content to load
        await this.page.waitForTimeout(3000);

        // Try different iframe selectors
        let bodyText = "";
        const iframeSelectors = [
            "iframe#html_msg_body",
            "iframe[name='html_msg_body']",
            "iframe#texthtml_msg_body",
            "iframe[name='texthtml_msg_body']",
            "iframe#iframeMail"
        ];

        for (const selector of iframeSelectors) {
            try {
                console.log(`Trying iframe: ${selector}`);
                const frame = this.page.frameLocator(selector);
                const frameBody = frame.locator("body");

                // Wait for body to be attached
                await frameBody.waitFor({ state: "attached", timeout: 5000 });

                // Wait for content to load with retry
                for (let i = 0; i < 10; i++) {
                    bodyText = await frameBody.innerText().catch(() => "");
                    if (bodyText.trim().length > 0) {
                        console.log(`Found content in ${selector}: ${bodyText.substring(0, 100)}...`);
                        break;
                    }
                    await this.page.waitForTimeout(1000);
                }

                if (bodyText.trim().length > 0) {
                    break;
                }
            } catch (e) {
                console.log(`Failed with ${selector}: ${e.message}`);
                continue;
            }
        }

        if (!bodyText || bodyText.trim().length === 0) {
            // Take screenshot for debugging
            const debugPath = `./reports/mailinator-iframe-debug-${Date.now()}.png`;
            await this.page.screenshot({ path: debugPath, fullPage: true });
            throw new Error(`Could not locate email body iframe with content. Screenshot: ${debugPath}`);
        }

        // EXACT match for your email content:
        // "Your temporary password is D8JHqYjZ"
        const match = bodyText.match(/Your temporary password is\s+([A-Za-z0-9]{6,})/i);

        if (!match) {
            const debugPath = `./reports/mailinator-password-debug-${Date.now()}.png`;
            await this.page.screenshot({ path: debugPath, fullPage: true });
            throw new Error(`Temporary password not found. Screenshot: ${debugPath}\nEmail body:\n${bodyText}`);
        }

        console.log("Temporary password extracted successfully");
        return match[1];
    }
}

module.exports = { MailinatorPage };
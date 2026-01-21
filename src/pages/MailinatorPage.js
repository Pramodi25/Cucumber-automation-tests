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
        // 1️⃣ Find the email row container (proper div/container detection)
        const subjectCell = page
            .locator('tr[ng-repeat="email in emails"] td:nth-child(3)')
            .filter({hasText: /Welcome to Chekku/i})
            .first();

        await expect(subjectCell).toBeVisible({timeout: 4 * 60 * 1000});
        await subjectCell.click();
    }

        async extractTempPassword() {
        console.log("Extracting password from email body...");

        // 2️⃣ Switch to email body container (iframe)
        const frame = this.page.frameLocator("iframe#html_msg_body, iframe[name='html_msg_body'], iframe#iframeMail, iframe").first();
        const body = frame.locator("body");

        // 3️⃣ Wait for password text to appear in the body
        await expect(body).toContainText(/Your temporary password is/i, {
            timeout: 60_000,
        });

        const bodyText = await body.innerText();

        // 4️⃣ Extract password
        const match = bodyText.match(/Your temporary password is\s+([A-Za-z0-9]{6,})/i);

        if (!match) {
            throw new Error(`Temporary password not found.\n\nEmail body:\n${bodyText}`);
        }

        console.log("Temporary password extracted successfully");
        return match[1];
    }
}

module.exports = { MailinatorPage };
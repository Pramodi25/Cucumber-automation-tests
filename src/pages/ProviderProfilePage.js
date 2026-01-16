const { expect } = require("@playwright/test");

class ProviderProfilePage {
    constructor(page) {
        this.page = page;
        // choose something stable on profile page (change this if needed)
        this.anyProfileMarker = page.locator("text=/provider profile|provider details|profile/i").first();

        // ✅ Top buttons (your XPaths)
        this.btnCompliance = page.locator(
            'xpath=//*[@id="rounded-lg"]/div/div/div[1]/div/div/div/a[1]'
        );
        this.btnOpportunities = page.locator(
            'xpath=//*[@id="rounded-lg"]/div/div/div[1]/div/div/div/a[2]'
        );
        this.btnSubscription = page.locator(
            'xpath=//*[@id="rounded-lg"]/div/div/div[1]/div/div/div/a[3]'
        );
        this.btnNotes = page.locator(
            'xpath=//*[@id="rounded-lg"]/div/div/div[1]/div/div/div/a[4]'
        );
        this.btnHistory = page.locator(
            'xpath=//*[@id="rounded-lg"]/div/div/div[1]/div/div/a'
        );

        // ✅ Profile page "Update" button/link
        this.profileUpdateLink = page.locator(
            'xpath=//*[@id="rounded-lg"]/div/div/div[2]/div[3]/a'
        );

        // ✅ Edit page fields
        this.firstNameInput = page.locator('xpath=//*[@id="id_first_name"]');
        this.lastNameInput = page.locator('xpath=//*[@id="id_last_name"]');

        // ✅ Edit page Update button
        this.editUpdateBtn = page.locator(
            'xpath=//*[@id="rounded-lg"]/div/div/div/form/button[1]'
        );

        // ✅ Name input on profile page (your screenshot shows a Name field input)
        // If this selector doesn't match your DOM, tell me the exact xpath for the Name field.
        this.profileNameInput = page.locator(
            'xpath=//*[@id="rounded-lg"]//label[normalize-space()="Name"]/following::input[1]'
        );
    }

    async waitForLoaded() {
        await this.page.waitForURL("**/staff/provider_profile/**", {
            timeout: 60000,
            waitUntil: "domcontentloaded", // ✅ not "load"
        });

        // ✅ Also wait for a real element on the page (best practice)
        await expect(this.anyProfileMarker).toBeVisible({timeout: 60000});
    }

    async getProviderIdFromUrl() {
        const url = this.page.url();
        const m = url.match(/\/staff\/provider_profile\/(\d+)/);
        if (!m) throw new Error(`Could not extract providerId from URL: ${url}`);
        return m[1];
    }

    async clickProfileUpdate() {
        await expect(this.profileUpdateLink).toBeVisible({ timeout: 60000 });

        // click and wait until edit page is opened
        await Promise.all([
            this.page.waitForURL("**/staff/update_provider_basic_info/**", {
                timeout: 60000,
                waitUntil: "domcontentloaded",
            }),
            this.profileUpdateLink.click(),
        ]);

        await expect(this.firstNameInput).toBeVisible({ timeout: 60000 });
    }

    async updateFirstAndLastName(firstName, lastName) {
        await expect(this.firstNameInput).toBeVisible({ timeout: 60000 });
        await expect(this.lastNameInput).toBeVisible({ timeout: 60000 });

        // ✅ clear then type
        await this.firstNameInput.fill("");
        await this.firstNameInput.type(firstName);

        await this.lastNameInput.fill("");
        await this.lastNameInput.type(lastName);

        await Promise.all([
            // after update it usually redirects back to profile page
            this.page.waitForURL("**/staff/provider_profile/**", {
                timeout: 60000,
                waitUntil: "domcontentloaded",
            }),
            this.editUpdateBtn.click(),
        ]);

        await this.waitForLoaded();
    }

    async assertProfileName(fullName) {
        // ✅ Most stable: page heading
        const heading = this.page.getByRole("heading", {
            name: new RegExp(`Profile Overview\\s*:\\s*${fullName}$`, "i"),
        });

        await expect(heading).toBeVisible({ timeout: 60000 });
    }

    async assertTopNavLinks(providerId) {
        const profileUrl = `https://dev.dashboard.chekku.au/staff/provider_profile/${providerId}`;

        const checks = [
            { locator: this.btnCompliance, expectedUrl: `https://dev.dashboard.chekku.au/staff/compliance_item_check/${providerId}` },
            { locator: this.btnOpportunities, expectedUrl: `https://dev.dashboard.chekku.au/staff/provider_opportunities/${providerId}` },
            { locator: this.btnSubscription, expectedUrl: `https://dev.dashboard.chekku.au/subscription/staff_subscription/${providerId}` },
            { locator: this.btnNotes, expectedUrl: `https://dev.dashboard.chekku.au/staff/staff_notes_list/${providerId}` },
            { locator: this.btnHistory, expectedUrl: `https://dev.dashboard.chekku.au/staff/provider_history/${providerId}` },
        ];

        for (const c of checks) {
            // Always start from profile page (reliable)
            await this.page.goto(profileUrl, { waitUntil: "domcontentloaded" });
            await this.waitForLoaded();

            await c.locator.scrollIntoViewIfNeeded();

            await Promise.all([
                this.page.waitForURL(c.expectedUrl, { timeout: 60000, waitUntil: "domcontentloaded" }),
                c.locator.click(),
            ]);

            await expect(this.page).toHaveURL(c.expectedUrl);
        }

        // end back on profile
        await this.page.goto(profileUrl, { waitUntil: "domcontentloaded" });
        await this.waitForLoaded();
    }
}

module.exports = { ProviderProfilePage };
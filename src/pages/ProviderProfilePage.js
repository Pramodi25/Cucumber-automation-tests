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
    }

    async waitForLoaded() {
        await this.page.waitForURL("**/staff/provider_profile/**", {
            timeout: 60000,
            waitUntil: "domcontentloaded", // ✅ not "load"
        });

        // ✅ Also wait for a real element on the page (best practice)
        await expect(this.anyProfileMarker).toBeVisible({timeout: 60000});
    }

    async assertTopNavLinks(providerId) {
        const checks = [
            {
                name: "Compliance",
                locator: this.btnCompliance,
                expectedUrl: `https://dev.dashboard.chekku.au/staff/compliance_item_check/${providerId}`,
            },
            {
                name: "Opportunities",
                locator: this.btnOpportunities,
                expectedUrl: `https://dev.dashboard.chekku.au/staff/provider_opportunities/${providerId}`,
            },
            {
                name: "Subscription",
                locator: this.btnSubscription,
                expectedUrl: `https://dev.dashboard.chekku.au/subscription/staff_subscription/${providerId}`,
            },
            {
                name: "Notes",
                locator: this.btnNotes,
                expectedUrl: `https://dev.dashboard.chekku.au/staff/staff_notes_list/${providerId}`,
            },
            {
                name: "History",
                locator: this.btnHistory,
                expectedUrl: `https://dev.dashboard.chekku.au/staff/provider_history/${providerId}`,
            },
        ];

        // Always come back by directly going to profile URL (no reliance on history)
        const profileUrl = `https://dev.dashboard.chekku.au/staff/provider_profile/${providerId}`;

        for (const c of checks) {
            await this.page.goto(profileUrl, {waitUntil: "domcontentloaded"});
            await this.waitForLoaded();

            await c.locator.scrollIntoViewIfNeeded();

            // detect if link opens a new tab
            const target = await c.locator.getAttribute("target");

            if (target === "_blank") {
                const [newPage] = await Promise.all([
                    this.page.context().waitForEvent("page"),
                    c.locator.click(),
                ]);

                await newPage.waitForLoadState("domcontentloaded");
                await expect(newPage).toHaveURL(c.expectedUrl);

                await newPage.close();
            } else {
                await Promise.all([
                    this.page.waitForURL(c.expectedUrl, {
                        timeout: 60000,
                        waitUntil: "domcontentloaded",
                    }),
                    c.locator.click(),
                ]);

                await expect(this.page).toHaveURL(c.expectedUrl);
            }

            // optional: small pause so you can visually see it in headed mode
            await this.page.waitForTimeout(700);
        }

        // finish back on profile page
        await this.page.goto(profileUrl, {waitUntil: "domcontentloaded"});
        await this.waitForLoaded();
    }
}

    module.exports = { ProviderProfilePage };
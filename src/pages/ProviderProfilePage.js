const { expect } = require("@playwright/test");

class ProviderProfilePage {
    constructor(page) {
        this.page = page;
        // choose something stable on profile page (change this if needed)
        this.anyProfileMarker = page.locator("text=/provider profile|provider details|profile/i").first();
    }

    async waitForLoaded() {
        await this.page.waitForURL("**/staff/provider_profile/**", {
            timeout: 60000,
            waitUntil: "domcontentloaded", // ✅ not "load"
        });

        // ✅ Also wait for a real element on the page (best practice)
        await expect(this.anyProfileMarker).toBeVisible({ timeout: 60000 });
    }
}

module.exports = { ProviderProfilePage };
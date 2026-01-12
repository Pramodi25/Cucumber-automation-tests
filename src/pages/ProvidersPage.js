const { expect } = require("@playwright/test");

class ProvidersPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Providers" });
    }

    async waitForLoaded() {
        await this.page.waitForURL("**/staff/provider_profile_list", { timeout: 60000 });
        await expect(this.heading).toBeVisible();
    }
}

module.exports = { ProvidersPage };
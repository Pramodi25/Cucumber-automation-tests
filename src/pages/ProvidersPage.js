const { expect } = require("@playwright/test");

class ProvidersPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Providers" });

        // xpath for the filter button in the Providers page header
        this.filterToggleBtn = this.page.locator('xpath=//*[@id="toggle-filter-btn"]');

        // ✅ Evidence filter panel is open: "Core Trade Type:" label appears
        this.coreTradeTypeLabel = page.getByText("Core Trade Type:", { exact: true });

        // ✅ Buttons that only appear in filter panel area
        this.applyFilterButton = page.getByRole("button", { name: /apply filter/i });
        this.clearFilterButton = page.getByRole("button", { name: /clear filter/i });
    }

    async waitForLoaded() {
        await this.page.waitForURL("**/staff/provider_profile_list", { timeout: 60000 });
        await expect(this.heading).toBeVisible();
    }

    async openFilterPanel() {
        await this.filterToggleBtn.waitFor({ state: "visible", timeout: 60000 });
        await this.filterToggleBtn.click();

        await this.page.getByText("Core Trade Type:", { exact: true }).waitFor({ state: "visible", timeout: 15000 });
    }

    async closeFilterPanelIfOpen() {
        // Optional: if clicking same filter button toggles close
        if (await this.coreTradeTypeLabel.isVisible().catch(() => false)) {
            await this.filterButton.click();
            await expect(this.coreTradeTypeLabel).toBeHidden({ timeout: 10000 });
        }
    }
}

module.exports = { ProvidersPage };
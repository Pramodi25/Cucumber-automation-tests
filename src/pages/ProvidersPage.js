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

        // Search input xpath
        this.searchInput = page.locator("#dt-search-0");

        // Table-related selectors (generic, but stable for most DataTables)
        this.table = page.locator("table"); // if you have a specific table id, replace this with that
        this.tableRows = this.table.locator("tbody tr");
        this.noMatchingRow = this.table.locator('text=/No matching records found/i');
        this.infoText = page.locator(
            'text=/Showing\\s+\\d+\\s+to\\s+\\d+\\s+of\\s+\\d+\\s+entries/i'
        );
        // DataTables processing overlay (covers most DataTables themes)
        this.processing = page.locator(".dataTables_processing, div.dt-processing, [id$='_processing']");


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

    async search(term) {
        await expect(this.searchInput).toBeVisible({ timeout: 15000 });

        // Fill search input
        await this.searchInput.fill(term);

        // If DataTables shows a processing overlay, wait for it to finish
        if (await this.processing.count()) {
            // It may flicker; wait for either hidden or detached
            await this.processing.first().waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
        }

        // Wait until table is not in a temporary loading state
        await expect.poll(async () => {
            // If "no matching" is visible, we're stable
            if (await this.noMatchingRow.isVisible().catch(() => false)) return "no-matching";

            // Otherwise read first row text
            const rowCount = await this.tableRows.count();
            if (rowCount === 0) return "no-rows";

            const t = ((await this.tableRows.first().innerText()) || "").toLowerCase().trim();
            return t;
        }, { timeout: 15000 }).not.toMatch(/loading|processing/);
    }

    async clearSearch() {
        await expect(this.searchInput).toBeVisible({ timeout: 15000 });
        await this.searchInput.fill("");

        if (await this.processing.count()) {
            await this.processing.first().waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
        }

        await expect.poll(async () => {
            const rowCount = await this.tableRows.count();
            return rowCount;
        }, { timeout: 15000 }).toBeGreaterThan(0);
    }

    async assertFilteredBy(term) {
        // ⏳ Wait until loading text disappears
        await this.page.waitForFunction(() => {
            const rows = document.querySelectorAll("table tbody tr");
            return [...rows].every(r => !r.innerText.toLowerCase().includes("loading"));
        }, { timeout: 15000 });

        // If no results is shown, filter still worked
        if (await this.noMatchingRow.isVisible().catch(() => false)) {
            await expect(this.noMatchingRow).toBeVisible();
            return;
        }

        const count = await this.tableRows.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const text = (await this.tableRows.nth(i).innerText()).toLowerCase();
            expect(text).toContain(term.toLowerCase());
        }
    }

    async closeFilterPanelIfOpen() {
        // Optional: if clicking same filter button toggles close
        if (await this.coreTradeTypeLabel.isVisible().catch(() => false)) {
            await this.filterButton.click();
            await expect(this.coreTradeTypeLabel).toBeHidden({ timeout: 10000 });
        }
    }
    async getInfoText() {
        const t = await this.infoText.first().textContent();
        return (t || "").trim();
    }
}

module.exports = { ProvidersPage };
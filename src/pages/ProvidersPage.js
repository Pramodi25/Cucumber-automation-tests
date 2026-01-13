const { expect } = require("@playwright/test");

class ProvidersPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
        this.heading = page.getByRole("heading", {name: "Providers"});

        // xpath for the filter button in the Providers page header
        this.filterToggleBtn = this.page.locator('xpath=//*[@id="toggle-filter-btn"]');

        // ✅ Evidence filter panel is open: "Core Trade Type:" label appears
        this.coreTradeTypeLabel = page.getByText("Core Trade Type:", {exact: true});

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

        // Core filters
        this.coreTradeType = page.locator("#filter-core-trade-type");
        this.subTradeType = page.locator("#filter-sub-trade-type");
        this.status = page.locator("#filter-status");
        this.startDate = page.locator("#filter-start-date");
        this.endDate = page.locator("#filter-end-date");
        this.complianceStatus = page.locator("#filter-compliance-status");
        this.subscriptionStatus = page.locator("#filter-subscription-status");
        this.source = page.locator("#filter-source");
        this.profileStatus = page.locator("#filter-profile-status");
        this.managedArea = page.locator("#filter-managed-area");

        this.applyFilterBtn = page.locator("#apply-filter");
        this.clearFilterBtn = page.locator("#clear-filter");

    }

    async waitForLoaded() {
        await this.page.waitForURL("**/staff/provider_profile_list", { timeout: 60000 });
        await expect(this.heading).toBeVisible();
    }

    async openFilterPanel() {
        await this.filterToggleBtn.waitFor({ state: "visible", timeout: 60000 });

        // If already open, do nothing
        if (await this.coreTradeTypeLabel.isVisible().catch(() => false)) return;

        await this.filterToggleBtn.click();
        await this.coreTradeTypeLabel.waitFor({ state: "visible", timeout: 15000 });
    }

    async selectDropdownByLabel(dropdownLocator, label) {
        await expect(dropdownLocator).toBeVisible({ timeout: 15000 });
        await expect(dropdownLocator).toBeEnabled({ timeout: 15000 });

        const wanted = label.trim().toLowerCase();

        // wait until options are loaded (more than 1 option is a common sign)
        await expect.poll(async () => {
            const opts = await dropdownLocator.locator("option").allTextContents();
            return opts.map(o => o.trim()).filter(Boolean).length;
        }, { timeout: 15000 }).toBeGreaterThan(1);

        const options = (await dropdownLocator.locator("option").allTextContents())
            .map(o => o.trim())
            .filter(Boolean);

        // 1) exact case-insensitive match
        let match = options.find(o => o.toLowerCase() === wanted);

        // 2) partial match fallback
        if (!match) {
            match = options.find(o => o.toLowerCase().includes(wanted));
        }

        if (!match) {
            throw new Error(
                `Option "${label}" not found in dropdown. Available options: ${options.join(" | ")}`
            );
        }

        await dropdownLocator.selectOption({ label: match });
    }

    async applyFilters() {
        await expect(this.applyFilterBtn).toBeVisible({ timeout: 15000 });
        await this.applyFilterBtn.click();
    }

    async clearFilters() {
        await expect(this.clearFilterBtn).toBeVisible({ timeout: 15000 });
        await this.clearFilterBtn.click();
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
        const t = term.toLowerCase();

        // Ensure input actually has the value
        await expect(this.searchInput).toHaveValue(term);

        // If no results, filter still worked
        if (await this.noMatchingRow.isVisible().catch(() => false)) {
            await expect(this.noMatchingRow).toBeVisible();
            return;
        }

        const count = await this.tableRows.count();
        expect(count).toBeGreaterThan(0);

        // ✅ Check ANY row contains the term (not only first row)
        let found = false;
        for (let i = 0; i < count; i++) {
            const rowText = ((await this.tableRows.nth(i).innerText()) || "").toLowerCase();
            if (rowText.includes(t)) {
                found = true;
                break;
            }
        }

        expect(found).toBeTruthy();
    }

    async closeFilterPanelIfOpen() {
        if (await this.coreTradeTypeLabel.isVisible().catch(() => false)) {
            await this.filterToggleBtn.click();
            await expect(this.coreTradeTypeLabel).toBeHidden({ timeout: 10000 });
        }
    }
    async getInfoText() {
        const t = await this.infoText.first().textContent();
        return (t || "").trim();
    }
}

module.exports = { ProvidersPage };
const { Sidebar } = require("./components/Sidebar");

class DashboardPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
        this.sidebar = new Sidebar(page);
    }

    async waitForLoaded() {
        await this.page.waitForURL("**/staff/dashboard", { timeout: 60000 });
    }

    async clickProvidersFromSidebar() {
        await this.sidebar.goToProviders();
    }
}

module.exports = { DashboardPage };
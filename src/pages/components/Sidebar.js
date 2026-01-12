class Sidebar {
    constructor(page) {
        this.page = page;
        this.providersLink = page.locator('a[href="/staff/provider_profile_list"]').first();
    }

    async goToProviders() {
        await this.providersLink.click();
    }
}

module.exports = { Sidebar };

const { When, Then } = require("@cucumber/cucumber");
const { ProvidersPage } = require("../pages/ProvidersPage");

Then("I should see the Providers page", async function () {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.waitForLoaded();
});

When("I open the Providers filter panel", async function () {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.openFilterPanel();
});

Then("I should see the Providers filters", async function () {
    // The openFilterPanel already asserts visibility; this can be a light check
    const providersPage = new ProvidersPage(this.page);
    // reuse open check idea without clicking again:
    await providersPage.coreTradeTypeLabel.waitFor({ state: "visible", timeout: 10000 });
});

//Search steps
When("I search providers for {string}", async function (term) {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.search(term);
});

Then("the providers table should be filtered by {string}", async function (term) {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.assertFilteredBy(term);
});

When("I clear the providers search", async function () {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.clearSearch();
});

Then("the providers table should show unfiltered results", async function () {
    const providersPage = new ProvidersPage(this.page);
    const now = await providersPage.getInfoText();

    // If info text exists, compare with before-search
    if (this.providersInfoBeforeSearch) {
        if (now !== this.providersInfoBeforeSearch) {
            throw new Error(
                `Providers table still looks filtered.\nBefore: ${this.providersInfoBeforeSearch}\nNow: ${now}`
            );
        }
    }
});
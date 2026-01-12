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

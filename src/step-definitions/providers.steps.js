const { When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");
const { ProvidersPage } = require("../pages/ProvidersPage");
const { ProviderProfilePage } = require("../pages/ProviderProfilePage");

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

// --------------------
// Filter steps
// --------------------

Then("the Sub Trade Type filter should be disabled", async function () {
    const providersPage = new ProvidersPage(this.page);
    await expect(providersPage.subTradeType).toBeDisabled();
});

When("I select Core Trade Type as {string}", async function (coreTradeType) {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.selectDropdownByLabel(providersPage.coreTradeType, coreTradeType);
});

Then("the Sub Trade Type filter should be enabled", async function () {
    const providersPage = new ProvidersPage(this.page);
    await expect(providersPage.subTradeType).toBeEnabled();
});

When("I select Sub Trade Type as {string}", async function (subTradeType) {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.selectDropdownByLabel(providersPage.subTradeType, subTradeType);
});

When("I select Status as {string}", async function (status) {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.selectDropdownByLabel(providersPage.status, status);
});

When("I set Start Date as {string}", async function (startDate) {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.startDate.fill(startDate);
});

When("I set End Date as {string}", async function (endDate) {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.endDate.fill(endDate);
});

When("I apply provider filters", async function () {
    const providersPage = new ProvidersPage(this.page);

    // Store baseline before applying filters (optional but useful)
    this.providersInfoBeforeFilter = await providersPage.getInfoText();

    await providersPage.applyFilters();
});

When("I clear provider filters", async function () {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.clearFilters();
});

Then("provider filters should be reset", async function () {
    const providersPage = new ProvidersPage(this.page);

    // These work if default value is empty string.
    await expect(providersPage.coreTradeType).toHaveValue("");
    await expect(providersPage.status).toHaveValue("");
    await expect(providersPage.startDate).toHaveValue("");
    await expect(providersPage.endDate).toHaveValue("");
});

//Search steps
When("I search providers for {string}", async function (term) {
    const providersPage = new ProvidersPage(this.page);

    // ✅ store baseline before searching (used by "unfiltered results" step)
    this.providersInfoBeforeSearch = await providersPage.getInfoText();

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

//Provider profile steps
When("I search provider name {string}", async function (name) {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.search(name);
});

When("I open provider profile for {string}", async function (name) {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.openProviderProfileFor(name);
});

Then("I should see the Provider profile page", async function () {
    const profilePage = new ProviderProfilePage(this.page);
    await profilePage.waitForLoaded();
});
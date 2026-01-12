const { Then } = require("@cucumber/cucumber");
const { ProvidersPage } = require("../pages/ProvidersPage");

Then("I should see the Providers page", async function () {
    const providersPage = new ProvidersPage(this.page);
    await providersPage.waitForLoaded();
});

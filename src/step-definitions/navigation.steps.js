const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");
const { LoginPage } = require("../pages/LoginPage");
const { DashboardPage } = require("../pages/DashboardPage");
const { ProvidersPage } = require("../pages/ProvidersPage");

Given("I am on the Chekku login screen", async function () {
    this.loginPage = new LoginPage(this.page);
    await this.loginPage.goto();
});

When("I login with staff user", async function () {
    await this.loginPage.login(process.env.E2E_EMAIL, process.env.E2E_PASSWORD);

    this.dashboardPage = new DashboardPage(this.page);
    await this.dashboardPage.waitForLoaded();
});

When("I click Providers from the sidebar", async function () {
    await this.dashboardPage.clickProvidersFromSidebar();
});

Then("I should be on the dashboard", async function () {
    await this.page.waitForURL("**/staff/dashboard", { timeout: 60000 });
    await expect(this.page).toHaveURL(/\/staff\/dashboard(\?.*)?$/);
});
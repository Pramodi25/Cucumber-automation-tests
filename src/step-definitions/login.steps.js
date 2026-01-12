const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");

Given("I am on the chekku login page", async function () {
    await this.page.goto(process.env.BASE_URL, { waitUntil: "domcontentloaded" });
});

When("I enter valid staff credentials", async function () {
    await this.page.getByLabel("Email").fill(process.env.E2E_EMAIL);
    await this.page.getByLabel("Password").fill(process.env.E2E_PASSWORD);
});

When("I click on the login button", async function () {
    await this.page.getByRole("button", { name: "Sign in" }).click();
});

Then("I should be redirected to the chekku dashboard", async function () {
    await this.page.waitForURL("**/staff/dashboard", { timeout: 20000 });
    await expect(this.page).toHaveURL(/\/staff\/dashboard(\?.*)?$/);
});
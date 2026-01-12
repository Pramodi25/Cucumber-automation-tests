const { Given } = require("@cucumber/cucumber");

Given("I open the Chekku login page", async function () {
    await this.page.goto("https://dev.dashboard.chekku.au/", { waitUntil: "domcontentloaded" });
});
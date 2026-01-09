const { Given } = require("@cucumber/cucumber");

Given("I open the Chekku login page", async function () {
    const base = process.env.BASE_URL; // https://dev.dashboard.chekku.au
    await this.page.goto(base, { waitUntil: "domcontentloaded" });
});


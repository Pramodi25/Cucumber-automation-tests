const { Before, After } = require("@cucumber/cucumber");
const { chromium } = require("playwright");

Before(async function () {
    const headless = process.env.HEADLESS !== "false";
    this.browser = await chromium.launch({ headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
});

After(async function () {
    await this.page?.close().catch(() => {});
    await this.context?.close().catch(() => {});
    await this.browser?.close().catch(() => {});
});

const { Before, After, Status } = require("@cucumber/cucumber");
const { chromium } = require("playwright");

Before(async function () {
    this.browser = await chromium.launch({ headless: process.env.HEADLESS !== "false" });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
});

After(async function (scenario) {
    if (scenario.result?.status === Status.FAILED) {
        const screenshot = await this.page.screenshot({ fullPage: true });
        await this.attach(screenshot, "image/png");
    }
    await this.page?.close().catch(() => {});
    await this.context?.close().catch(() => {});
    await this.browser?.close().catch(() => {});
});

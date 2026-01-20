const { Before, After, setDefaultTimeout, Status } = require("@cucumber/cucumber");
const { chromium } = require("playwright");
const { RegistrationPage } = require("../pages/RegistrationPage");

setDefaultTimeout(60 * 1000); // 60 seconds

Before(async function () {
    const headless = process.env.HEADLESS !== "false";
    this.browser = await chromium.launch({ headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    this.registrationPage = new RegistrationPage(this.page);
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

const { Before, After, setDefaultTimeout, Status } = require("@cucumber/cucumber");
const { chromium } = require("playwright");
const { RegistrationPage } = require("../pages/RegistrationPage");

setDefaultTimeout(6 * 60 * 1000); // 60 seconds

Before(async function () {
    const headless = process.env.HEADLESS !== "false";
    this.browser = await chromium.launch({ headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    this.registrationPage = new RegistrationPage(this.page);
});

After(async function (scenario) {
    try {
        if (this.page && !this.page.isClosed()) {
            const img = await this.page.screenshot();
            await this.attach(img, "image/png");
        }
    } catch (e) {
        // ignore screenshot failures if page/context already closed
    }

    await this.page?.close().catch(() => {});
    await this.context?.close().catch(() => {});
});

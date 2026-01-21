const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");

Given("I am on the Chekku registration page", async function () {
    await this.page.goto(`${process.env.BASE_URL}/register`, {
        waitUntil: "domcontentloaded",
    });
});

Then("I should see the registration page with required fields", async function () {
    await expect(this.page.locator("#id_email")).toBeVisible();
    await expect(this.page.locator("#id_first_name")).toBeVisible();
    await expect(this.page.locator("#id_last_name")).toBeVisible();
    await expect(this.page.locator("#id_trading_name")).toBeVisible();
    await expect(this.page.locator("#id_phone_number")).toBeVisible();
    await expect(this.page.locator("#id_business_address")).toBeVisible();
    await expect(this.page.locator("form select").first()).toBeVisible();
    await expect(this.page.getByRole("button", { name: /register/i })).toBeVisible();
});

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

When('I click {string}', async function (text) {
    const button = this.page.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(text)}$`, "i"),
    });
    if (await button.count()) {
        await button.first().click();
        return;
    }

    const link = this.page.getByRole("link", {
        name: new RegExp(escapeRegExp(text), "i"),
    });
    if (await link.count()) {
        await link.first().click();
        return;
    }

    await this.page.getByText(text, { exact: false }).first().click();
});

/**
 * Shared helper to fill registration form without duplication.
 */
async function fillRegistrationForm(page, email) {
    await page.locator("#id_email").fill(email);
    await page.locator("#id_first_name").fill("Test");
    await page.locator("#id_last_name").fill("Script");
    await page.locator("#id_trading_name").fill("Test Zone Pvt Ltd");
    await page.locator("#id_phone_number").fill("0433333333"); // digits only

    const tradeTypeSelect = page.locator('select[name="trade_type"]');
    await tradeTypeSelect.waitFor({state: "visible"});

    const tradeTypeValue = await tradeTypeSelect.evaluate((sel) => {
        const wanted = "starlink";
        const opt = Array.from(sel.options).find((o) =>
            (o.textContent || "").toLowerCase().includes(wanted)
        );
        return opt ? opt.value : null;
    });

    if (!tradeTypeValue) throw new Error('Could not find Trade Type containing "STARLINK"');
    await tradeTypeSelect.selectOption(tradeTypeValue);

    // Address autocomplete (your current manual step)
    const addressInput = page.locator("#id_business_address");
    await addressInput.fill("");
    await addressInput.type("Rosetta TAS 7010, Australia", {delay: 100});

    // Wait for Google Maps autocomplete to appear
    await page.waitForTimeout(2000);

    // ⏸️ MANUAL STEP: Wait for user to click the address suggestion
    console.log("\nPlease select the Google Maps address suggestion...");

    // Give user time to manually select the address
    await page.waitForTimeout(15000);

    console.log("Address selected, continuing...");

    // ✅ Confirm the field is now filled with the selected value
    await expect(addressInput).not.toHaveValue("");

    // ✅ Close the autocomplete dropdown by clicking somewhere else or pressing Escape
    await addressInput.press("Escape");
    await page.waitForTimeout(500);

    // ✅ Ensure the pac-container is hidden
    const pacContainer = page.locator(".pac-container");
    if (await pacContainer.count() > 0) {
        // Click on a safe area to close dropdown (like the page title)
        await page.locator("h1, h2, body").first().click({ force: true }).catch(() => {});
        await page.waitForTimeout(500);
    }
}

When("I complete the provider registration form with valid details", async function () {
    const uniqueEmail = `testscript.${Date.now()}@mailinator.com`;
    await fillRegistrationForm(this.page, uniqueEmail);
});

When("I complete the provider registration form with a new Mailinator email", async function () {
    const inbox = `chekku.327.${Date.now()}`;
    const email = `${inbox}@mailinator.com`;

    // store for email + login steps
    this.mailInbox = inbox;
    this.mailEmail = email;

    await fillRegistrationForm(this.page, email);
});

When("I submit the registration", async function () {
    await this.page.getByRole("button", { name: /^register$/i }).click();
});

Then('I should be redirected to the {string} page', async function (title) {
    await this.page.waitForLoadState("networkidle");

    const url = this.page.url();
    const stillOnRegister = /\/register\/?#?$/.test(url) || url.includes("/register#");

    if (stillOnRegister) {
        const possibleErrors = this.page.locator(
            ".error, .text-red-500, .invalid-feedback, [role='alert'], .alert, .text-danger"
        );

        if (await possibleErrors.count()) {
            const msg = (await possibleErrors.first().innerText()).trim();
            throw new Error(
                `Registration did not complete. Still on register page. Error shown: ${msg}. URL: ${url}`
            );
        }

        throw new Error(`Registration did not complete. Still on register page. URL: ${url}`);
    }

    await expect(this.page.getByText(new RegExp(title, "i"))).toBeVisible({ timeout: 15000 });
});
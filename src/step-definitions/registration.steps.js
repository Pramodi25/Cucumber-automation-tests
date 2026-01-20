const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");

Given("I am on the Chekku registration page", async function () {
    await this.page.goto(`${process.env.BASE_URL}/register`, { waitUntil: "domcontentloaded" });
});

Then("I should see the registration page with required fields", async function () {
    await expect(this.page.locator("#id_email")).toBeVisible();
    await expect(this.page.locator("#id_first_name")).toBeVisible();
    await expect(this.page.locator("#id_last_name")).toBeVisible();
    await expect(this.page.locator("#id_trading_name")).toBeVisible();
    await expect(this.page.locator("#id_phone_number")).toBeVisible();
    await expect(this.page.locator("#id_business_address")).toBeVisible();

    // Trade type select exists
    await expect(this.page.locator("form select").first()).toBeVisible();

    // Register button exists
    await expect(this.page.getByRole("button", { name: /register/i })).toBeVisible();
});

When('I click {string}', async function (text) {
    // Prefer clicking a real button/link first (stable + avoids headings)
    const button = this.page.getByRole('button', { name: new RegExp(`^${escapeRegExp(text)}$`, 'i') });
    if (await button.count()) {
        await button.first().click();
        return;
    }

    const link = this.page.getByRole('link', { name: new RegExp(escapeRegExp(text), 'i') });
    if (await link.count()) {
        await link.first().click();
        return;
    }

    // Fallback: text click (non-strict)
    await this.page.getByText(text, { exact: false }).first().click();
});

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

When("I complete the provider registration form with valid details", async function () {
    const uniqueEmail = `testscript.${Date.now()}@mailinator.com`;

    await this.page.locator("#id_email").fill(uniqueEmail);
    await this.page.locator("#id_first_name").fill("Test");
    await this.page.locator("#id_last_name").fill("Script");
    await this.page.locator("#id_trading_name").fill("Test Zone Pvt Ltd");
    await this.page.locator("#id_phone_number").fill("0433333333"); // use digits only to avoid format validation

    const tradeTypeSelect = this.page.locator('select[name="trade_type"]');
    await tradeTypeSelect.waitFor({ state: "visible" });

    const tradeTypeValue = await tradeTypeSelect.evaluate((sel) => {
        const wanted = "starlink";
        const opt = Array.from(sel.options).find(o =>
            (o.textContent || "").toLowerCase().includes(wanted)
        );
        return opt ? opt.value : null;
    });

    if (!tradeTypeValue) throw new Error('Could not find Trade Type containing "STARLINK"');
    await tradeTypeSelect.selectOption(tradeTypeValue);

    // ✅ Fill address field slowly (triggers autocomplete)
    const addressInput = this.page.locator("#id_business_address");
    await addressInput.fill(""); // clear first
    await addressInput.type("Rosetta TAS 7010, Australia", { delay: 100 });

    // Wait for Google Maps autocomplete to appear
    await this.page.waitForTimeout(2000);

    // ⏸️ MANUAL STEP: Wait for user to click the address suggestion
    console.log("\n⏸️  PAUSED: Please manually click the Google Maps address suggestion from the dropdown");
    console.log("The test will continue in 15 seconds...\n");

    // Give user time to manually select the address
    await this.page.waitForTimeout(15000);


    // ✅ Confirm the field is now filled with the selected value
    await expect(addressInput).not.toHaveValue("");
});

When("I submit the registration", async function () {
    await this.page.getByRole("button", { name: /^register$/i }).click();
});

Then('I should be redirected to the {string} page', async function (title) {
    // Give the form time to submit + UI to update
    await this.page.waitForLoadState("networkidle");

    // If still on register page, capture validation errors
    const url = this.page.url();
    const stillOnRegister = /\/register\/?#?$/.test(url) || url.includes("/register#");

    if (stillOnRegister) {
        // Try common error locations
        const possibleErrors = this.page.locator(
            ".error, .text-red-500, .invalid-feedback, [role='alert'], .alert, .text-danger"
        );

        if (await possibleErrors.count()) {
            const msg = (await possibleErrors.first().innerText()).trim();
            throw new Error(`Registration did not complete. Still on register page. Error shown: ${msg}. URL: ${url}`);
        }

        // Fallback: throw with URL only
        throw new Error(`Registration did not complete. Still on register page. URL: ${url}`);
    }

    // Otherwise, assert some success-ish content
    await expect(this.page.getByText(new RegExp(title, "i"))).toBeVisible({ timeout: 15000 });
});
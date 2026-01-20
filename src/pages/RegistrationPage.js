class RegistrationPage {
    constructor(page) {
        this.page = page;

        this.email = page.locator("#id_email");
        this.firstName = page.locator("#id_first_name");
        this.lastName = page.locator("#id_last_name");
        this.tradingName = page.locator("#id_trading_name");
        this.mobileNumber = page.locator("#id_phone_number");
        this.businessAddress = page.locator("#id_business_address");

        // ✅ Add this HERE (in constructor)
        this.tradeTypeSelect = page
            .locator("form")
            .locator('label:has-text("Trade type")')
            .locator("..")
            .locator("select");

        this.registerBtn = page.getByRole("button", { name: /register/i });
    }

    async fillForm(data) {
        await this.email.fill(data.email);
        await this.firstName.fill(data.firstName);
        await this.lastName.fill(data.lastName);
        await this.tradingName.fill(data.tradingName);
        await this.mobileNumber.fill(data.mobileNumber);

        // ✅ Add this HERE (when filling the form)
        await this.tradeTypeSelect.selectOption({ label: data.tradeType });

        await this.businessAddress.fill(data.businessAddress);
    }

    async submit() {
        await this.registerBtn.click();
    }
}

module.exports = { RegistrationPage };
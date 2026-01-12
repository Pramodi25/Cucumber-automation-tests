class LoginPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;
        this.emailInput = page.getByLabel("Email");
        this.passwordInput = page.getByLabel("Password");
        this.signInButton = page.getByRole("button", { name: "Sign in" });
    }

    async goto() {
        const base = process.env.BASE_URL || "https://dev.dashboard.chekku.au";
        await this.page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
    }

    async login(email, password) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.signInButton.click();
    }
}

module.exports = { LoginPage };

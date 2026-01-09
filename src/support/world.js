const { setWorldConstructor, World } = require("@cucumber/cucumber");

class PWWorld extends World {
    constructor(options) {
        super(options);
        this.browser = null;
        this.context = null;
        this.page = null;
    }
}

setWorldConstructor(PWWorld);
module.exports = {
    default: {
        paths: ["features/**/*.feature"],
        require: ["src/**/*.js"],
        format: [
            "progress",
            "html:reports/cucumber.html"
        ],
        publishQuiet: true,
    }
};

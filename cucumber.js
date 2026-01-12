module.exports = {
    default: {
        paths: ["features/**/*.feature"],
        require: ["src/**/*.js"],
        format: [
            "progress",
            "json:reports/cucumber-report.json"
        ],
        publishQuiet: true,
    }
};

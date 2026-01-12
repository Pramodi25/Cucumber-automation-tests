const report = require("multiple-cucumber-html-reporter");

report.generate({
    jsonDir: "reports",
    reportPath: "reports/html",
    reportName: "Chekku Automation Report",
    pageTitle: "Chekku E2E Test Results",
    displayDuration: true,

    metadata: {
        browser: {
            name: "chromium",
            version: "playwright"
        },
        platform: {
            name: process.platform
        },
        device: "MacBook Air"
    },

    customData: {
        title: "Run Info",
        data: [
            { label: "Project", value: "Chekku Dashboard" },
            { label: "Environment", value: process.env.BASE_URL || "dev" },
            { label: "Executed", value: new Date().toLocaleString() }
        ]
    }
});

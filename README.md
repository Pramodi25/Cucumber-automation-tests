# Cucumber-automation-tests

A small Cucumber.js + Playwright test repository with example feature files and step definitions.

This repository contains end-to-end tests written with Cucumber (`@cucumber/cucumber`) and uses Playwright for browser automation.

## Highlights
- Tests located under `features/` and step definitions in `src/step-definitions/`.
- Playwright is included as a dependency; run `npx playwright install` to install the browsers.
- Useful npm scripts are defined in `package.json` for quick runs.

## Requirements
- Node.js 16 or later
- npm (or yarn)

## Quick setup

1. Install dependencies

   ```bash
   npm install
   ```

2. (Optional) Install Playwright browsers

   ```bash
   npx playwright install
   ```

## Running tests

- Run the default test suite (headless):

  ```bash
  npm test
  ```

- Run tests with headed browser (useful for debugging):

  ```bash
  npm run test:headed
  # or
  HEADLESS=false npm test
  ```

- Run only smoke tests (uses the `@smoke` tag):

  ```bash
  npm run smoke
  ```

- Run a single feature file:

  ```bash
  npx cucumber-js features/auth/login.feature
  ```

- Run tests filtered by tag(s):

  ```bash
  npx cucumber-js --tags "@yourTag"
  ```

## Project structure

```
.
├── package.json         # scripts and dependencies
├── cucumber.js          # cucumber configuration (if present)
├── features/            # `.feature` files
│   └── auth/
│       └── login.feature
├── src/
│   ├── step-definitions/
│   │   └── login.steps.js
│   └── support/
│       ├── hooks.js
│       └── world.js
└── reports/
    └── cucumber.html    # example HTML report
```

## Tips for writing tests
- Keep feature files readable: use Feature -> Scenario -> Given/When/Then.
- Reuse step definitions where possible; keep them deterministic and fast.
- Use tags to group slow or flaky tests (e.g. `@smoke`, `@wip`).

## Playwright notes
- Playwright is available in this project. If you need to run tests in a specific browser, set the PLAYWRIGHT_BROWSERS environment variable or configure Playwright in your step code.
- To run with visible (headed) mode set `HEADLESS=false`.

## Reports
- A sample HTML report is available at `reports/cucumber.html`. If you generate reports during CI or locally, drop them into `reports/` or add a script to produce them automatically.

## Troubleshooting
- "Step not found" errors: ensure the text in the `.feature` step matches a step definition regexp/string in `src/step-definitions/`.
- Playwright errors: make sure browsers are installed with `npx playwright install`.
- If tests hang, run a single scenario or enable headed mode to observe the browser.

## Contributing
- Open issues and PRs on the repository's GitHub page.

## License
- This project uses the ISC license as declared in `package.json`.


If you want, I can also:
- add example commands for generating an HTML report from Cucumber output,
- add a simple CI configuration (GitHub Actions) to run tests on push/pull request.

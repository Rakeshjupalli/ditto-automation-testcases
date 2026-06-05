# Playwright Automation Projects

This repository contains two separate Playwright automation projects using the Page Object Model (POM) architecture.

## 📁 Project Structure

```
├── hdfcergo/
│   ├── pages/
│   │   ├── HealthFormPage.js
│   │   └── PremiumSummaryPage.js
│   ├── tests/
│   │   └── premiumValidation.spec.js
│   ├── reports/                  ← HTML reports & screenshots on failure
│   └── playwright.config.js      ← Configured with reporter outputFolder: 'reports'
│
├── makemytrip/
│   ├── pages/
│   │   ├── HotelHomePage.js
│   │   └── HotelListingPage.js
│   ├── tests/
│   │   └── searchHotels.spec.js
│   ├── reports/                  ← HTML reports & screenshots on failure
│   └── playwright.config.js      ← Configured with screenshots: 'only-on-failure'
│
└── package.json
```

---

## 🏨 /makemytrip — Hotel Search Automation

**Objective:** Search and list all hotels in Mumbai for the current date on MakeMyTrip.

### Features
- Navigates to makemytrip.com
- Handles dynamic popups, login banners, and overlay modals
- Selects Hotels category
- Searches for "Mumbai" with autocomplete dropdown selection
- Dynamically calculates and selects today's check-in and tomorrow's check-out dates
- Implements infinite scroll and pagination handling on results page
- Extracts hotel names and prices
- Logs clean, formatted results to console

### Run Tests
```bash
cd makemytrip
npm install
npx playwright install chromium
npm test
```

### View Report
```bash
npm run report
```

---

## 🛡️ /hdfcergo — Insurance Premium Validation

**Objective:** Validate premium calculations, riders, and tax application on Ditto Insurance (HDFC ERGO Optima Secure).

### Features
- Navigates to app.joinditto.in/fq
- Selects Health Insurance → HDFC ERGO Optima Secure
- Walks through "Tell us about you" wizard
- Configures individual ("You") plan with demographics
- Extracts Base Premium, Rider Costs, GST, and Total Premium
- Performs explicit mathematical assertion:
  ```
  Total Premium = Base Premium + Selected Riders + GST
  ```

### Run Tests
```bash
cd hdfcergo
npm install
npx playwright install chromium
npm test
```

### View Report
```bash
npm run report
```

---

## ⚙️ Global Configuration

Both projects include:
- **HTML Reporter** outputting to `./reports/`
- **Screenshots on failure** (`screenshot: 'only-on-failure'`)
- **Video recording** on first retry
- **Traces** on first retry
- **Retry logic**: 2 retries on CI, 1 locally
- **Viewport**: 1920x1080
- **Timeouts**: 15s action, 30s navigation

---

## 🛠️ Tech Stack

| Technology | Version |
|-----------|---------|
| Playwright | ^1.40.0 |
| JavaScript | ES6+ Modules |
| Architecture | Page Object Model (POM) |

---

## 📝 License

MIT

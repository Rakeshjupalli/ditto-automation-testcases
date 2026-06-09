# Playwright Automation Suite

End-to-end browser automation for Booking.com hotel search and HDFC ERGO insurance premium validation.

Both projects use Playwright with the Page Object Model pattern.

---

## Project Structure

```
├── booking.com/
│   ├── pages/
│   │   └── BookingSearchPage.js
│   ├── tests/
│   │   └── searchHotels.spec.js
│   ├── reports/
│   └── playwright.config.js
│
├── hdfcergo/
│   ├── pages/
│   │   ├── BasePage.js
│   │   ├── ProductSelectionPage.js
│   │   ├── FamilyDetailsPage.js
│   │   └── PremiumPage.js
│   ├── tests/
│   │   └── testhdfc.spec.js
│   ├── fixtures.js
│   ├── testData.js
│   ├── reports/
│   └── playwright.config.js
│
└── sync-hdfcergo.js
```

---

## Booking.com — Hotel Search

**What it does:**
Searches for hotels in Mumbai on Booking.com and extracts the first 30 hotel names via lazy-scroll.

**Test flow:**
1. Opens booking.com
2. Dismisses popups/banners
3. Enters "mumbai" as destination
4. Selects check-in (15 Jun) and check-out (16 Jun)
5. Sets 2 adults, 1 room
6. Runs search
7. Scrolls and collects 30 hotel names
8. Logs results to console

**Run:**
```bash
cd booking.com
npx playwright test
```

**View report:**
```bash
npx playwright show-report reports
```

---

## HDFC ERGO — Premium Validation

**What it does:**
Walks through the Ditto Insurance (joinditto.in) flow for HDFC ERGO Optima Secure and validates premium calculations at checkout.

**Test flow:**
1. Navigates to app.joinditto.in
2. Selects Health → HDFC ERGO Optima Secure
3. Completes the intro wizard
4. Configures family: Self (M, 28), Spouse (F, 29), Son (10), Father, Mother
5. Enters pincode 517113
6. Calculates premium
7. Selects policy period and proceeds to buy
8. Verifies member details on checkout summary
9. Extracts premium breakdown and asserts:
   ```
   Total Premium = Base Premium + Riders + GST
   ```

**Run:**
```bash
cd hdfcergo
npx playwright test
```

**View report:**
```bash
npx playwright show-report reports
```

---

## Shared Configuration

| Setting | Value |
|---------|-------|
| Browser | Chromium (Desktop Chrome) |
| Viewport | 1920×1080 |
| Headless | true |
| Screenshots | on (every test) |
| Video | on-first-retry |
| Trace | on-first-retry |
| Retries | 1 local / 2 on CI |
| Action timeout | 15s |
| Navigation timeout | 30s |

Reports are written to `./reports/` and artifacts to `./test-results/`.

---

## Prerequisites

Node.js 18+ and Playwright browsers:

```bash
npx playwright install chromium
```

Playwright is already installed at the workspace root (`node_modules/`).

---

## Tech Stack

- Playwright ^1.40.0
- JavaScript (ES modules)
- Page Object Model

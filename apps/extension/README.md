# Wishify Extension

Browser extension built with [WXT](https://wxt.dev) that saves products from any store to Wishify.

- Signs in through the web app (better-auth session cookie).
- Scrapes the active tab for product details, falling back to an empty form.
- Lets the user edit the details, then saves them to the web app.

## Setup

1. `WXT_API_URL` points at the web app. `.env.development` sets it to `http://localhost:3000` for `npm run dev`. Set it in the environment for production builds.
2. Load the extension, copy its ID from `chrome://extensions`, and set `BETTER_AUTH_TRUSTED_ORIGINS=chrome-extension://<id>` in `apps/web/.env.local`.

## Scripts

- `npm run dev` - start Chrome with the extension loaded and hot reload
- `npm run build` - typecheck and build to `.output/chrome-mv3`
- `npm run zip` - package the build for store upload
- `npm test` - run scraper tests

Firefox variants: `dev:firefox`, `build:firefox`, `zip:firefox`.

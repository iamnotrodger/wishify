# Wishify

**Want it? Save it. Wishify tells you when you can afford it, and when it gets cheaper.**

That cart you're about to check out? Don't. Click once, and it's on your list.
Wishify turns every "I need this right now" into a plan: what you'll buy, in
which month, with money you actually have.

> Status: in active development, heading for a public v1.

---

## Why

Your wants are scattered across a dozen stores and forty tabs, and none of them
know what you can spend. So you either buy on impulse or forget about it.

Wishify fixes both. Saving an item **takes the place of buying it**. Then the
plan does the hard part for you.

## How it works

1. **Capture.** Hit the extension on any product page. Name, price, image and
   store land in your list.
2. **Prioritize.** Rank each item by how much you want it.
3. **Allocate.** Set one monthly allowance for wants. Wishify fills each month
   in priority order and rolls the rest into later months. Every item gets a
   planned purchase date, automatically.
4. **Watch.** Wishify tracks prices. When something drops, you get an email,
   and the item can jump to an earlier month.
5. **Decide.** Mark it **bought** (it counts against this month) or
   **dropped** (it counts as money saved).

## The budget, in plain terms

- **One allowance.** A single monthly amount for everything you want.
- **Rollover works both ways.** Unspent money carries forward. So does
  overspend. Your budget is one running balance.
- **Big items save up.** Something pricier than a month's allowance waits
  until the balance covers it, and earlier months show what they set aside.
- **Smart, not rigid.** Items fill months by priority, but cheap items can
  slip into gaps without bumping anything already planned.
- **Pin it.** Lock an item to a month and the plan works around it.
- **Need-by dates.** Got a birthday coming? Set a date, and Wishify flags the
  item **At risk** if the plan can't make it.
- **Off-plan is fine.** Buy early if you want. Later items shift back.
- **No surprises.** Any change that moves items shows you exactly what moves
  before you confirm: _"This moves Kindle Paperwhite to January."_

### See it in action

A $400 monthly allowance, starting in November:

| Month | Available | You buy                         | Rolls over |
| ----- | --------- | ------------------------------- | ---------- |
| Nov   | $400.00   | Headphones, hand balm, notebook | $67.01     |
| Dec   | $467.01   | Jacket, Kindle                  | $68.02     |
| Jan   | $468.02   | Dutch oven                      | $48.07     |
| Feb   | $448.07   | Mug                             | $318.12    |
| Mar   | $718.12   | Switch 2                        | $268.13    |

Eight wants, five months, zero overspending. And rollover means the $420
Dutch oven and the $450 Switch 2 each land in a single month.

### Every month, a scorecard

On the 1st, last month closes and you get a review: spent vs allowance, items
dropped, and how much you saved. "Saved" counts every item you walked away
from, plus every dollar a price drop knocked off something you bought.

## Price drops you can trust

Stores love an inflated "was" price. Wishify ignores it. A drop is measured
against the item's **own price history**: you get an alert when the price
falls below both what it cost when you saved it and its lowest price in the
last 30 days, or below your own alert price.

## What's in v1

- One-click save from the browser extension
- Prioritized list, monthly allowance and a month-by-month plan
- Buy and drop, with a running saved total
- Price history and email drop alerts
- Google sign-in

---

## Under the hood

A [Turborepo](https://turbo.build/repo) monorepo, 100% TypeScript.

| Path                         | What it is                                                 |
| ---------------------------- | ---------------------------------------------------------- |
| `apps/web`                   | Next.js web app: list, plan and budget                     |
| `apps/extension`             | [WXT](https://wxt.dev) browser extension: one-click save   |
| `packages/schema`            | Shared Zod schemas and types (`@repo/schema`)              |
| `packages/scraper`           | Product scraper: site rules, JSON-LD, microdata, OpenGraph |
| `packages/database`          | Prisma schema and client (`@repo/db`)                      |
| `packages/ui`                | Shared React components                                    |
| `packages/eslint-config`     | ESLint configs                                             |
| `packages/typescript-config` | Shared `tsconfig.json`s                                    |
| `packages/vitest-config`     | Shared Vitest config                                       |

Auth is [better-auth](https://better-auth.com) with Google, plus email and
password sign-in in development so you don't need Google credentials locally.

## Local setup

Requires [nvm](https://github.com/nvm-sh/nvm) and Docker with Compose.

```sh
nvm use
npm install
docker compose up -d          # Postgres on localhost:5432
cp .env.example packages/database/.env
npm run db:migrate:deploy
npm run dev
```

`apps/web/.env.local` needs `DATABASE_URL` (same value as `.env.example`),
`AUTH_SECRET`, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

For the extension, see [apps/extension/README.md](apps/extension/README.md).

After changing `packages/database/prisma/schema.prisma`, run
`npm run db:migrate:dev` to create and apply a migration.

## Scripts

| Command          | Does                      |
| ---------------- | ------------------------- |
| `npm run dev`    | Run every app in dev mode |
| `npm run build`  | Build everything          |
| `npm run lint`   | Lint everything           |
| `npm run test`   | Run all tests             |
| `npm run format` | Format with Prettier      |

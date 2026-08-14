# Resole — Full Feature Task Catalog & Workflows

**Scope:** Web app only (`apps/web`), branch `feat/inboxandprofile`.
**Run it:** `npm run dev:web` from the repo root → `http://localhost:3000`.

Every label, route, and button below is copied from the live component source (not
reconstructed from memory) — if a screen says something different, that mismatch is
itself a finding, not a mistake on the tester's part.

Items tagged **🚩 FLAG** have no handler wired in the code today. Log them as findings,
not as things you did wrong.

- **Part 1** breaks the app into pages. Every clickable element on a page gets its own
  stable task ID (e.g. `NAV-1`, `LIST-9`, `SELL-3.7`).
- **Part 2** strings those same task IDs into six persona workflows, so a full journey
  and an isolated page audit reference the exact same catalog.

---

## How to run this

1. Run `npm run dev:web`, open `http://localhost:3000`.
2. Work top to bottom within a page block; tick each task ID pass/fail.
3. Some tasks need a second account's data to exist first (someone else's listing, an
   incoming offer) — see the matching workflow in Part 2 for the setup order.
4. Guest flows need a logged-out session — use a private/incognito window.

---

## Table of contents

**Part 1 — Task catalog**
[Global chrome](#global-chrome) · [Home](#home) · [Market](#market) · [Listing detail](#listing-detail) · [Sell wizard](#sell-wizard) · [Swap](#swap) · [Checkout](#checkout) · [Inbox](#inbox) · [Profile overview](#profile-overview) · [My Listings](#my-listings) · [Favourites](#favourites) · [Rewards](#rewards) · [Settings](#settings) · [Transactions](#transactions) · [Public profile](#public-profile)

**Part 2 — Workflows**
[Guest](#guest) · [Buyer](#buyer) · [Seller](#seller) · [Swapper](#swapper) · [Donor](#donor) · [Account Holder](#account-holder)

**Reference**
[Coverage matrix](#coverage-matrix) · [Known no-ops & gaps](#known-no-ops--gaps)

---

# Part 1 — Page-by-page task catalog

## Global chrome

Navbar, footer, mobile bottom nav, and the auth modal appear (or can be triggered) from anywhere in the app.

### Top navbar

| ID | Click this | Expect |
|----|------------|--------|
| `NAV-1` | Resole logo (top-left) | Navigates to `/` |
| `NAV-2` | **Home** nav link | `/`, link underlines blue when active |
| `NAV-3` | **Market** nav link | `/market` |
| `NAV-4` | **Sell** nav link | `/sell` |
| `NAV-5` | Type into the "Search marketplace..." bar | 🚩 confirm it actually filters results — field has no submit or live handler visible |
| `NAV-6` | Inbox icon (signed in) | `/inbox` |
| `NAV-7` | Inbox icon (signed out) | Auth modal opens, prompt "Log in to view your messages." |
| `NAV-8` | Profile icon (signed in) | `/profile` |
| `NAV-9` | **Log In** (signed out) | Auth modal opens on Log In |
| `NAV-10` | **Sign Up** (signed out) | Auth modal opens on Sign Up |

### Footer

| ID | Click this | Expect |
|----|------------|--------|
| `FOOT-1` | "Resole" wordmark | `/` |
| `FOOT-2` | "Sustainability Mission" | 🚩 targets `/sustainability` — confirm the page exists |
| `FOOT-3` | "AI Valuation Info" | 🚩 targets `/ai-valuation` — confirm it exists |
| `FOOT-4` | "Seller Terms" | 🚩 targets `/terms` — confirm it exists |
| `FOOT-5` | "Privacy Policy" | 🚩 targets `/privacy` — confirm it exists |

### Mobile bottom nav (viewport < 768px)

| ID | Click this | Expect |
|----|------------|--------|
| `MNAV-1` | Home icon | `/` |
| `MNAV-2` | Market (storefront) icon | `/market` |
| `MNAV-3` | Sell (+) icon | `/sell` |
| `MNAV-4` | Profile icon | `/profile` |

### Auth modal

| ID | Click this | Expect |
|----|------------|--------|
| `AUTH-1` | **Sign Up** toggle pill | Form switches to sign-up, adds "Confirm password" |
| `AUTH-2` | **Log In** toggle pill | Form switches back, removes confirm field |
| `AUTH-3` | Eye icon on Password field | Toggles masked/plaintext |
| `AUTH-4` | Eye icon on Confirm password (sign-up) | Same toggle, independent of `AUTH-3` |
| `AUTH-5` | "Forgot password?" (sign-in only) | Opens the reset-password step; submitting an email shows "Check your email" |
| `AUTH-6` | Submit sign-up with a weak password | Inline error: password rule message (8+ chars, upper, lower, number) |
| `AUTH-7` | Submit sign-up with mismatched passwords | Inline error: "Passwords do not match." |
| `AUTH-8` | **Create Account** / **Log In** submit | Button reads "Please wait…", then modal closes and resumes the action that triggered it |
| `AUTH-9` | "Continue with Google / Apple ID / Facebook" | 🚩 visual only, no provider wired — confirm expected |
| `AUTH-10` | × close (top-right) or the dark backdrop | Modal dismisses, any pending gated action is cancelled |
| `AUTH-11` | Press **Esc** | Same as `AUTH-10` |

## Home
`/`

Signed-in landing page: your own inventory, your saved shoes, and a charity picker. Guests still load it but the tabs will be empty.

| ID | Click this | Expect |
|----|------------|--------|
| `HOME-1` | "Try Valuation" hero button | `/sell` |
| `HOME-2` | "My Inventory" tab | Grid shows listings you created |
| `HOME-3` | "Saved Shoes" tab | Grid shows your favourited listings |
| `HOME-4` | "Browse the full market →" | `/market` |
| `HOME-5` | "Filters" pill | Expands Category + Brand pill panel |
| `HOME-6` | A Category pill (e.g. Running) | Grid filters, pill fills blue, active-filter chip appears above |
| `HOME-7` | A Brand pill (e.g. Nike) | Second filter stacks with the first |
| `HOME-8` | × on one active-filter chip | Removes just that filter |
| `HOME-9` | "Clear all" | Removes both filters at once |
| `HOME-10` | Heart icon on a card (signed in) | Fills red instantly, Saved Shoes count updates |
| `HOME-11` | Heart icon (signed out) | Auth modal opens |
| `HOME-12` | A listing card's image/title | `/listings/[id]` |
| `HOME-13` | A charity card under "Support a Cause" | Card highlights with a checkmark — 🚩 no visible confirm/submit step after selecting |
| `HOME-14` | "List a pair →" / "Browse the market →" (empty-state links) | `/sell` or `/market` |

## Market
`/market`

The public catalogue: a Swap Board and an Explore Marketplace grid. No login required to browse.

| ID | Click this | Expect |
|----|------------|--------|
| `MKT-1` | "Brand" filter pill | 🚩 confirm it opens real options, not decorative |
| `MKT-2` | "Size" filter pill | Same check |
| `MKT-3` | "Condition" filter pill | Same check |
| `MKT-4` | "Price Range" filter pill | Same check |
| `MKT-5` | "All Filters" button | 🚩 confirm a fuller filter panel opens |
| `MKT-6` | "Propose Swap" on a Swap Board card | `/swap?id=[listingId]` |
| `MKT-7` | Swap Board card body (not the button) | `/listings/[id]` |
| `MKT-8` | "Sort by" dropdown (Latest / Price ↑ / Price ↓) | Re-orders the Explore Marketplace grid |
| `MKT-9` | Heart icon on an Explore card | Toggles saved |
| `MKT-10` | An Explore Marketplace card | `/listings/[id]` |
| `MKT-11` | Floating "+ Sell Your Kicks" button | `/sell` |

## Listing detail
`/listings/[id]`

Where Buy Now, Make Offer, and Swap Offer all live. Which buttons show depends on the listing's mode (Sell / Swap / Both).

| ID | Click this | Expect |
|----|------------|--------|
| `LIST-1` | A thumbnail strip image | Swaps the main gallery photo |
| `LIST-2` | Heart icon on the main photo | Toggles saved, or opens Auth modal if signed out |
| `LIST-3` | Seller name/avatar in the seller card | 🚩 not currently a link to `/users/[id]` — confirm intended |
| `LIST-4` | "Chat" button on the seller card | `/inbox` |
| `LIST-5` | Amber "Make Offer" button | Opens "Make an Offer" sheet, price pre-filled to asking price |
| `LIST-6` | Edit "Your offer price" in that sheet | "Send Offer" activates once the field is non-empty |
| `LIST-7` | "Message to seller (optional)" textarea | Free text, no validation |
| `LIST-8` | "Send Offer" | "Offer Sent!", redirects to `/inbox` |
| `LIST-9` | Green "Buy Now" button | Opens "Order Summary" sheet |
| `LIST-10` | "Confirm Purchase" | "Order Placed!", redirects to `/inbox` |
| `LIST-11` | Purple "Swap Offer" button (Swap/Both listings only) | `/swap?id=[id]` |
| `LIST-12` | A "Related Sneakers" card | `/listings/[relatedId]` (full reload) |
| `LIST-13` | "Go Back Home" (error/not-found state) | `/` |

## Sell wizard
`/sell` (add `?edit=[id]` to reuse it for editing an existing listing)

Five steps: Photos → AI Results → Edit Listing → Review → Confirmation.

### Step 1 of 4 — Photos

| ID | Click this | Expect |
|----|------------|--------|
| `SELL-1.1` | Any empty tile — Top / Left Side / Right Side / Sole / Insole Right / Insole Left View | Opens file picker |
| `SELL-1.2` | Drag a file onto a tile | Same as picking — preview fills the tile |
| `SELL-1.3` | × on a filled tile | Clears that slot, progress bar drops |
| `SELL-1.4` | "Analyze with AI" (enabled once all 6 are filled) | Advances to AI Results; uploads then runs analysis |
| `SELL-1.5` | Fill 5 slots from one pair and 1 slot with a clearly different shoe, then "Analyze with AI" | Blocked on AI Results with a red error naming the odd photo's slot; no advance to Edit Listing. Back-chevron returns to Photos |
| `SELL-1.6` | Upload a genuine 6-photo set where one photo is noticeably dimmer/warmer than the rest | Still passes — lighting differences must not be mistaken for a different shoe. An amber lighting tip is fine, a red error is a bug |

### Step 2 of 4 — AI Results

| ID | Click this | Expect |
|----|------------|--------|
| `SELL-2.1` | Back-chevron in the step header | Returns to Photos |
| `SELL-2.2` | "Looks Good" | Advances to Edit Listing, form pre-filled from AI output (brand, model, condition, price, description) |

### Step 3 of 4 — Edit Listing

| ID | Click this | Expect |
|----|------------|--------|
| `SELL-3.1` | "Brand \*" / "Model \*" / "Colorway \*" fields | Required — inline error if left blank on continue |
| `SELL-3.2` | "Size (US) \*" field | Strips non-numeric characters as you type |
| `SELL-3.3` | "Category" dropdown | Running / Basketball / Football / Casual / Other |
| `SELL-3.4` | Condition slider (1–10) | Condition label pill and number update live |
| `SELL-3.5` | "This pair has been refurbished/restored" checkbox | Toggles on/off |
| `SELL-3.6` | "Asking Price" (₱) field | Numeric only |
| `SELL-3.7` | Listing Type card — "Sell" / "Swap" / "Both" | Selects listingMode; controls which buttons a buyer later sees on this listing |
| `SELL-3.8` | "Description" textarea | Free text |
| `SELL-3.9` | Back-chevron | Returns to AI Results |
| `SELL-3.10` | "Review Listing" (disabled until required fields validate) | Advances to Review |

### Step 4 of 4 — Review

| ID | Click this | Expect |
|----|------------|--------|
| `SELL-4.1` | Back-chevron or the "Edit" button | Returns to Edit Listing |
| `SELL-4.2` | "Publish Listing" (create) / "Save Changes" (edit) | Publishes/updates, advances to Confirmation |
| `SELL-4.3` | Force a failed submit (e.g. offline) | Red error banner shows, stays on Review |

### Confirmation

| ID | Click this | Expect |
|----|------------|--------|
| `SELL-5.1` | "Go to Marketplace" | `/market` |
| `SELL-5.2` | "List Another" (create flow only) | Resets wizard to Step 1, clears form/photos |
| `SELL-5.3` | "Back to My Listings" (edit flow only) | `/profile/listings` |

## Swap
`/swap?id=[listingId]`

Side-by-side trade builder: your item vs. theirs, with optional cash top-up.

| ID | Click this | Expect |
|----|------------|--------|
| `SWAP-1` | Back-chevron (header) | Browser back |
| `SWAP-2` | "Change shoe" under "Your Offer" | Opens a dropdown of your own inventory |
| `SWAP-3` | A shoe inside that dropdown | Swaps the "Your Offer" square, recalculates the value diff |
| `SWAP-4` | "Add extra cash (optional)" field | "Even swap" / "under by" / "over by" recalculates live |
| `SWAP-5` | "Add a note" textarea | Free text |
| `SWAP-6` | "Send Swap Proposal" | Alert: "Swap offer securely submitted to escrow!", redirects to `/market` |

## Checkout
`/checkout?id=[listingId]`

🚩 Nothing currently links to this page — Buy Now on the listing page uses its own inline modal instead (see `LIST-9`/`LIST-10`). Test it anyway so we know whether to wire it up or retire it.

| ID | Click this | Expect |
|----|------------|--------|
| `CHK-1` | Back-chevron (header) | Browser back |
| `CHK-2` | "Edit" next to Delivery Address | 🚩 no click handler wired — button is currently inert |
| `CHK-3` | A payment method row — GCash / Card / Bank Transfer | Selects that radio, row highlights |
| `CHK-4` | Type a code + click "Apply" (promo code) | 🚩 "Apply" has no click handler wired |
| `CHK-5` | "Confirm & Pay ₱[total]" | Alert: "Payment authorized successfully!", redirects to `/market` |

## Inbox
`/inbox`

Conversation list on the left, thread on the right. Offer/swap cards render inline in the message stream.

| ID | Click this | Expect |
|----|------------|--------|
| `INBX-1` | "All" / "Offers" / "Updates" tab | Filters the conversation list |
| `INBX-2` | A conversation row | Loads that thread on the right; on mobile, replaces the list view |
| `INBX-3` | Back-chevron in the thread header (mobile) | Returns to the conversation list |
| `INBX-4` | The other person's name in the thread header | `/users/[id]` |
| `INBX-5` | "Accept" on an offer/swap card (listing owner only) | Card updates in place to "Offer accepted", buttons disappear |
| `INBX-6` | "Decline" on an offer/swap card | Card updates to "Offer declined" |
| `INBX-7` | Type a message, press **Enter** or click the ↑ send button | Posts right-aligned in your bubble color, list preview updates |
| `INBX-8` | Press **Shift+Enter** in the message box | Inserts a newline instead of sending |

## Profile overview
`/profile`

Your own dashboard: identity, Recycle Coins balance, and preview cards into every other profile page.

| ID | Click this | Expect |
|----|------------|--------|
| `PROF-1` | Avatar circle | Opens Edit Profile modal |
| `PROF-2` | Pencil icon next to your name | Same modal |
| `PROF-3` | "Change photo" (inside modal) | File picker, updates the preview immediately |
| `PROF-4` | "Remove" (only shown once a photo is set) | Clears avatar back to the initial letter |
| `PROF-5` | "Full name" / "Location" fields | Free text |
| `PROF-6` | "Cancel" | Discards changes, closes modal |
| `PROF-7` | "Save changes" (disabled if name is blank) | Persists, closes modal, header updates |
| `PROF-8` | "Redeem Now" (Recycle Coins card) | `/profile/rewards` |
| `PROF-9` | "View Perks" (Recycle Coins card) | `/profile/rewards` |
| `PROF-10` | "View all" (My Listings preview) | `/profile/listings` |
| `PROF-11` | "View all" (Favourites preview) | `/profile/favourites` |
| `PROF-12` | "Transactions" quick-link row | `/profile/transactions` |
| `PROF-13` | Sidebar items (desktop) — Profile / My Listings / Rewards / Favourites / Transactions / Settings | Navigates, highlights the active item |

## My Listings
`/profile/listings`

Active vs. Removed inventory. Donating only becomes available after a listing is removed.

| ID | Click this | Expect |
|----|------------|--------|
| `PLIST-1` | "Active" / "Removed" tab | Switches list, counts update |
| `PLIST-2` | Pencil (edit) icon on an Active row | `/sell?edit=[id]` |
| `PLIST-3` | Trash (delete) icon on an Active row | Confirm dialog: "Remove [item]? This will take it off the market. You can re-list or donate it later." |
| `PLIST-4` | Confirm that dialog | Item moves from Active to Removed |
| `PLIST-5` | "Re-list" on a Removed card | Moves straight back to Active, no confirmation needed |
| `PLIST-6` | "Donate" on a Removed card | Opens "Choose a charity" sheet |
| `PLIST-7` | A charity row in that sheet | Spinner, then alert "Thank you! Your shoe has been donated.", item disappears from both tabs |
| `PLIST-8` | × to close the charity sheet without choosing | Cancels, item stays in Removed |

## Favourites
`/profile/favourites`

🚩 This page currently renders a hard-coded mock list (8 sample sneakers), not your real saved items — the preview card on `/profile` uses the live API, this full page doesn't yet. Worth confirming before testers assume the grid reflects their own hearts.

| ID | Click this | Expect |
|----|------------|--------|
| `PFAV-1` | Heart icon on a favourite card | Removes it from the visible grid (client-side only, per the current mock) |

## Rewards
`/profile/rewards`

Redeem Recycle Coins, and review how you earned/spent them.

| ID | Click this | Expect |
|----|------------|--------|
| `PREW-1` | Points-cost pill on a Redeem option (e.g. "200 pts") | Attempts redemption; disabled/greyed if your balance can't afford it |
| `PREW-2` | Scroll the History list | Read-only ledger of coin earn/spend events with dates |

## Settings
`/profile/settings`

Account fields, notification toggles, static info links, and session/account actions.

| ID | Click this | Expect |
|----|------------|--------|
| `PSET-1` | Any Account row — Full name / Email / Phone / Location / Password | 🚩 rows show a chevron but have no click handler wired yet |
| `PSET-2` | "Messages" toggle | Switches on/off, animates |
| `PSET-3` | "Offers & bids" toggle | Switches on/off |
| `PSET-4` | "Promotions" toggle | Switches on/off |
| `PSET-5` | "Recycle reminders" toggle | Switches on/off |
| `PSET-6` | "Privacy policy" / "Terms of service" / "Help & support" / "About Resole" | 🚩 rows have no click handler wired yet |
| `PSET-7` | "Log out" | Confirm dialog: "Log out? You will need to sign in again." — 🚩 actual sign-out call is a stub pending auth wiring |
| `PSET-8` | "Delete account" | Confirm dialog: "Delete account? All your data will be permanently removed. This cannot be undone." — 🚩 same stub status as `PSET-7` |

## Transactions
`/profile/transactions`

History split into three tabs.

| ID | Click this | Expect |
|----|------------|--------|
| `PTX-1` | "sales" / "swaps" / "donations" tab | Switches the list below |
| `PTX-2` | A tab with nothing in it | Empty state: "No [tab] yet" |

## Public profile
`/users/[id]`

Someone else's profile — just their header, reviews, and live listings. None of your own profile tools show up here.

| ID | Click this | Expect |
|----|------------|--------|
| `USR-1` | "Back" (top-left) | Browser back |
| `USR-2` | "Reviews" tab | Shows star ratings + comments left by other users |
| `USR-3` | "Listings" tab | Shows that seller's currently live listings |
| `USR-4` | A listing card in that grid | `/listings/[id]` |

---

# Part 2 — Persona workflows, built from the catalog

Same six personas, expressed as ordered task IDs from Part 1 — look up the matching
table above for the exact click and expected result at each step.

## Guest

**Browse without an account** — `GUEST-01`
`NAV-3 → MKT-10 → LIST-1`

**Hit the sign-in wall** — `GUEST-02`
`LIST-2 → AUTH-10 → NAV-7`

**Create an account** — `GUEST-03`
`NAV-10 → AUTH-1 → AUTH-6 → AUTH-7 → AUTH-8`

**Log in** — `GUEST-04`
`NAV-9 → AUTH-2 → AUTH-8`

## Buyer

**Buy Now** — `BUYER-01` *(needs a live listing from a different account)*
`MKT-10 → LIST-9 → LIST-10 → INBX-2`

**Make an offer** — `BUYER-02`
`LIST-5 → LIST-6 → LIST-7 → LIST-8 → INBX-2`

**Save and revisit favourites** — `BUYER-03`
`LIST-2 → HOME-3 → PROF-11`

## Seller

**List a new pair** — `SELLER-01`
`NAV-4 → SELL-1.1 → SELL-1.4 → SELL-2.2 → SELL-3.7 → SELL-3.10 → SELL-4.2 → SELL-5.1`

**Edit an existing listing** — `SELLER-02`
`PROF-10 → PLIST-2 → SELL-4.2`

**Remove, re-list, or donate** — `SELLER-03`
`PLIST-3 → PLIST-4 → PLIST-5` (or `PLIST-6 → PLIST-7`)

**Respond to an incoming offer** — `SELLER-04` *(needs a Buyer- or Swapper-flow tester to have already sent one)*
`INBX-2 → INBX-5` (or `INBX-6`) `→ INBX-7`

**Check seller performance** — `SELLER-05`
`NAV-8` → scroll to Seller Analytics card

## Swapper

**Propose from the Swap Board** — `SWAP-01`
`MKT-6 → SWAP-2 → SWAP-3 → SWAP-4 → SWAP-6`

**Propose from a listing page** — `SWAP-02`
`LIST-11 → SWAP-3 → SWAP-6`

**Respond to an incoming swap** — `SWAP-03`
`INBX-2 → INBX-5` (or `INBX-6`)

## Donor

**Donate a listing** — `DONOR-01`
`PLIST-3 → PLIST-4 → PLIST-6 → PLIST-7`

**Redeem Recycle Coins** — `DONOR-02`
`PROF-8 → PREW-1 → PREW-2`

**Review donation history** — `DONOR-03`
`PROF-12 → PTX-1`

## Account Holder

**Update notification settings** — `ACCT-01`
`NAV-8 → PROF-13 → PSET-2 → PSET-3 → PSET-4 → PSET-5`

**Review full transaction history** — `ACCT-02`
`PROF-12 → PTX-1`

**View another user's public profile** — `ACCT-03`
`INBX-4` (or `USR-2` `→ USR-3 → USR-4`)

**Log out** — `ACCT-04`
`PSET-7`

---

# Coverage matrix

One row per page, one column per persona that should exercise it.

| Page | Guest | Buyer | Seller | Swapper | Donor | Account |
|------|:-----:|:-----:|:------:|:-------:|:-----:|:-------:|
| `/` | ● | ● | | | | |
| `/market` | ● | ● | ● | ● | | |
| `/listings/[id]` | ● | ● | | ● | | ● |
| `/sell` | | | ● | | | |
| `/swap` | | | | ● | | |
| `/checkout` | | ●¹ | | | | |
| `/inbox` | ●² | ● | ● | ● | | ● |
| `/profile` | | ● | ● | | ● | ● |
| `/profile/listings` | | | ● | | ● | |
| `/profile/favourites` | | ● | | | | |
| `/profile/rewards` | | | | | ● | |
| `/profile/settings` | | | | | | ● |
| `/profile/transactions` | | | | | ● | ● |
| `/users/[id]` | | | | | | ● |

¹ `/checkout` isn't reachable from Buy Now today — test it in isolation, don't expect to land there mid-flow.
² Guests only reach `/inbox` by hitting the auth gate (`NAV-7`).

---

# Known no-ops & gaps

Every item below is tagged 🚩 in its table above too — collected here so you don't have
to hunt for them while running a workflow.

- **Two "buy" experiences.** `LIST-9`/`LIST-10` confirm a purchase inline on the listing
  page; the separate `CHK-1`–`CHK-5` checkout page (address, promo code, escrow
  breakdown) is unreachable from that flow.
- **Favourites full page uses mock data.** `PFAV-1` operates on eight hard-coded sample
  sneakers, not your real saved list — the `PROF-11` preview card is already wired to
  the live API, this page isn't yet.
- **Settings rows without handlers.** `PSET-1` (Account fields) and `PSET-6`
  (Privacy/Terms/Help/About) render a chevron implying navigation but have nothing
  wired.
- **Checkout stubs.** `CHK-2` ("Edit" address) and `CHK-4` ("Apply" promo) have no click
  handlers.
- **Auth stubs.** `AUTH-9` (social logins) is visual only. `AUTH-5` ("Forgot password?") is now wired — see the new `/reset-password` page for the rest of the flow.
- **Session stubs.** `PSET-7` / `PSET-8` show real confirm dialogs, but the underlying
  sign-out/delete calls are marked pending in the code — confirm current behavior
  rather than assuming either is broken.
- **Home charity picker has no submit.** `HOME-13` lets you highlight a charity card
  with no visible next step — likely meant to set a default for future donations.
- **Footer links are unverified routes.** `FOOT-2`–`FOOT-5` point at `/sustainability`,
  `/ai-valuation`, `/terms`, `/privacy` — confirm each resolves rather than 404s.
- **Search bar.** `NAV-5` in the navbar has no visible submit or live filter — confirm
  it's meant to do something yet.
- **Seller name isn't a link on the listing page.** `LIST-3` — contrast with `INBX-4`,
  which does link to the same public profile.

---

*Compiled from `apps/web/src` on `feat/inboxandprofile` — every ID, label, and route
above is read directly from the component source. Re-generate after UI changes land.*

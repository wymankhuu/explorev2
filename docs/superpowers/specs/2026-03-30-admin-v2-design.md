# Admin System v2 — Design Spec

## Overview

Transform the current hidden, per-app admin mode into a full content management experience with a persistent toolbar, visual indicators, drag-and-drop reorder, bulk operations, and a dedicated dashboard.

## Current State

- Admin mode is triggered by a hidden `···` button at the bottom of the AppDrawer
- Password auth stored in `sessionStorage` (`explorev2-admin-mode`, `explorev2-admin-pwd`)
- Capabilities: edit 5 text fields per app, pin/unpin, reorder (API-only, no UI)
- Brute-force protection via Redis (5 failed attempts in 15 min = IP lockout)
- No overview of content health, no bulk operations, no drag-and-drop

## Features

### 1. Shared Admin State — `useAdmin` Hook

**What:** Extract admin auth from `AdminPanel` into a shared React hook so any component can check admin status.

**Interface:**
```ts
function useAdmin(): {
  isAdmin: boolean;
  password: string;
  login: (pwd: string) => void;
  logout: () => void;
}
```

**Behavior:**
- Reads/writes `sessionStorage` keys `explorev2-admin-mode` and `explorev2-admin-pwd`
- `login()` sets both keys; `logout()` clears both
- All components using this hook share the same auth state within a session
- `AdminPanel` refactored to use this hook instead of its own internal auth state

**File:** `src/hooks/useAdmin.ts`

### 2. Admin Toolbar Banner

**What:** A persistent thin amber bar at the top of every page when admin mode is active.

**Content (left to right):**
- Amber dot + "Admin Mode" label
- Stats: "{X} apps pinned · {Y} missing content"
- "Dashboard" link → `/admin`
- "Exit" button → calls `logout()` from `useAdmin`

**Behavior:**
- Rendered in `layout.tsx`, conditionally shown when `isAdmin` is true
- Fixed position, sits above the Navbar
- Stats computed from the apps data passed as props
- Amber background (`bg-amber-50 border-b border-amber-200`)

**File:** `src/components/AdminToolbar.tsx`

**Layout change:** `layout.tsx` wraps content in a client component that provides admin context. The toolbar renders above the Navbar when active.

### 3. Visual Admin Indicators on Cards

**What:** When admin mode is active, AppCard shows visual overlays indicating pin status and content completeness.

**Indicators:**
- **Pin badge:** Small pin icon in top-right corner if `app.pinned === true`. Blue background (`bg-blue-500 text-white`), 20x20px rounded.
- **Warning dot:** Small amber dot in top-right corner (offset from pin badge) if `app.usage` or `app.impact` is empty. Tooltip: "Missing usage or impact".
- **Edit pencil:** On hover in admin mode, a subtle pencil icon appears on the card. Clicking opens the drawer with admin mode pre-activated.

**Props added to AppCard:**
```ts
isAdminMode?: boolean;
onAdminEdit?: () => void; // opens drawer in admin mode
```

**Behavior:**
- Non-admin users see zero changes (indicators only render when `isAdminMode` is true)
- Warning dot checks: `!app.usage || !app.impact`
- Pin badge and warning dot can stack (pin top-right, warning dot below it)

### 4. Drag-and-Drop Reorder for Pinned Apps

**What:** On the Apps tab, when admin mode is active, the pinned showcase grid becomes drag-sortable.

**Dependency:** `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`

**Behavior:**
- Only active when `isAdmin` is true AND viewing the non-filtered showcase (pinned apps)
- Each card gets a drag handle (grip dots icon, top-left, visible only in admin mode)
- On drag end, compute the new order array and call `POST /api/admin-reorder` with `{ password, items: [{ appName, order }] }`
- Optimistic UI: reorder immediately, revert on API failure
- Show a brief "Order saved" toast on success

**Scope:** Only the pinned showcase grid on the Apps tab. Collection detail pages and filtered views are not drag-sortable.

**File:** Wrap the showcase grid in a `SortableShowcaseGrid` component. `src/components/SortableShowcaseGrid.tsx`

### 5. Bulk Pin/Unpin

**What:** When admin mode is active, cards gain a selectable checkbox for batch operations.

**UI:**
- Checkbox appears in the top-left corner of each AppCard (admin mode only)
- When 1+ cards are selected, a floating action bar appears at the bottom of the screen
- Action bar content: "{N} selected" + "Pin to Showcase" button + "Unpin" button + "Clear Selection" button
- Amber styling consistent with admin theme

**Behavior:**
- Selection state managed in `HomePage` via a `Set<string>` of app IDs
- "Pin to Showcase" calls `/api/admin-pin` for each selected app sequentially (with `pinned: true`)
- "Unpin" calls `/api/admin-pin` for each selected app with `pinned: false`
- After batch operation, clear selection and show a toast: "X apps pinned/unpinned"
- Max 9 pinned per collection enforced server-side (existing logic)
- Works on the Apps tab (both showcase and filtered views)

**File:** `src/components/BulkActionBar.tsx`

### 6. `/admin` Dashboard Page

**What:** A dedicated admin page with content health overview and showcase management.

**Auth:** Password modal on first visit (same password as existing admin mode). Uses `useAdmin` hook. If already authed from the drawer, dashboard is immediately accessible.

**Layout — two sections, vertically stacked on mobile, side-by-side on desktop:**

#### Top: Stats Bar
- 4 stat cards in a row: Total Apps, Complete Content, Missing Content, Total Stars (sum of all star counts)
- "Complete" = has description AND usage AND impact
- Color-coded: green for complete count, amber for missing count

#### Left Panel: Health Table (60% width on desktop)
- Compact table of all apps
- **Columns:** Name, Creator, Collection (first tag), Completeness (icon row: description/usage/impact as green check or red X), Pinned (yes/no), Stars
- **Row colors:** Green tint if all 3 content fields filled, amber if 1-2 missing, red tint if all missing
- **Sortable** by any column (click header to toggle asc/desc)
- **Filterable** by collection (dropdown above table)
- **Searchable** (text input filters by name/creator)
- Clicking a row expands it inline for quick-edit (Feature 7)

#### Right Panel: Showcase Manager (40% width on desktop)
- Shows currently pinned apps grouped by collection
- Each group is a collapsible section with the collection name as header
- Within each group, apps are listed in current `homepageOrder` with drag-to-reorder (uses same `@dnd-kit` setup)
- Each app row has: name, order number, "Unpin" button
- "Add to Showcase" button at bottom of each group → opens a picker modal showing unpinned apps from that collection

**File:** `src/app/admin/page.tsx` (server shell) + `src/components/AdminDashboard.tsx` (client)

**Data:** The dashboard fetches all apps via the same `getAllData()` function. Star counts fetched client-side via `/api/stars` (existing endpoint).

### 7. Inline Quick-Edit from Dashboard

**What:** Clicking an app row in the health table expands it accordion-style to show editable fields.

**Expanded row content:**
- 5 text fields: Creator, Role, Description, Usage, Impact (same as current AdminPanel)
- "Save" button → calls `POST /api/admin-save`
- "Cancel" button → collapses without saving
- Pin/Unpin toggle button

**Behavior:**
- Only one row expanded at a time (expanding another collapses the previous)
- On successful save, row color updates immediately to reflect new completeness
- Fields pre-populated with current values
- Same API and password auth as existing admin-save

## Architecture

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useAdmin.ts` | Shared admin auth hook |
| `src/components/AdminToolbar.tsx` | Persistent admin banner |
| `src/components/SortableShowcaseGrid.tsx` | Drag-and-drop wrapper for pinned apps |
| `src/components/BulkActionBar.tsx` | Floating bar for bulk pin/unpin |
| `src/app/admin/page.tsx` | Admin dashboard server shell |
| `src/components/AdminDashboard.tsx` | Admin dashboard client component |

### Modified Files
| File | Change |
|------|--------|
| `src/app/layout.tsx` | Add AdminToolbar (conditionally rendered) |
| `src/components/AppCard.tsx` | Add admin indicators (pin badge, warning dot, checkbox, drag handle) |
| `src/components/HomePage.tsx` | Integrate bulk selection state, pass admin mode to cards, wrap showcase in sortable grid |
| `src/components/AdminPanel.tsx` | Refactor to use `useAdmin` hook instead of internal auth |
| `src/components/AppDrawer.tsx` | Use `useAdmin` hook for admin toggle |

### New Dependency
- `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`

### No API Changes
All existing API routes (`/api/admin-save`, `/api/admin-pin`, `/api/admin-reorder`, `/api/stars`) are sufficient. No new endpoints needed.

## Out of Scope
- Activity/audit log
- Preview mode
- Scheduled pinning
- Submission review queue (would need Notion schema change)
- Multi-user admin (single shared password remains)

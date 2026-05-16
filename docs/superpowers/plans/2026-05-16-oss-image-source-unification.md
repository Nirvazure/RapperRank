# OSS Image Source Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify rapper image delivery onto publicly readable Aliyun OSS URLs while keeping static TypeScript data as the only source of truth, removing runtime reliance on `public/rapper`, and showing an explicit placeholder whenever OSS media is missing.

**Architecture:** Keep the current static rapper dataset in `src/data`, but tighten its image semantics so `mediaUrl` is the primary image, `avatarUrl` becomes optional, and UI components resolve image URLs through a single shared helper with deterministic fallback rules. The UI must never fall back to local `/rapper/...` assets. Missing images render a shared placeholder visual so the layout remains stable while migration is incomplete.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, Vitest, existing component library in `src/components`

---

## File Structure

**Modify**
- `src/features/rappers/rapper.types.ts`
  - Relax image field requirements so `avatarUrl` is optional and `mediaUrl` can represent a missing OSS image during migration.
- `src/features/rappers/rapper.schema.ts`
  - Remove support for local `/...` image paths and define the new OSS-or-missing image rules.
- `src/features/rappers/rapper.schema.test.ts`
  - Update dataset assertions to match OSS-only semantics and missing-image handling.
- `src/data/rappers.ts`
  - Replace local `/rapper/...` references with OSS URLs or explicit missing values.
- `src/data/chinese-rappers.ts`
  - Replace local `/rapper/...` references with OSS URLs or explicit missing values, and stop using the local placeholder as seeded image data.
- `src/components/rapper/RapperMediaPanel.tsx`
  - Use the shared image resolver for the hero media slot and render a placeholder state when no media is available.
- `src/components/rapper/RapperGallery.tsx`
  - Use the shared image resolver in grid cards and preserve card layout when image data is missing.
- `src/components/rapper/RapperSelector.tsx`
  - Use the shared avatar resolver and placeholder treatment for compact selector items.
- `src/components/favorites/FavoritesPageClient.tsx`
  - Use the shared media resolver in favorite cards.
- `src/components/profile/EditableRatingsList.tsx`
  - Use the shared avatar resolver in the ratings list.
- `src/components/profile/FavoriteList.tsx`
  - Use the shared avatar resolver in the favorite sidebar list.
- `src/components/rapper/CollapsibleRapperSelector.tsx`
  - Use the shared avatar resolver in the collapsed selector trigger.

**Create**
- `src/features/rappers/rapper.media.ts`
  - Centralize image URL resolution and placeholder metadata for all rapper UI.

**Optional Modify If Search Confirms Usage**
- `src/components/rapper/RapperProfilePanel.tsx`
- `src/components/ranking/RankingItem.tsx`
- `src/components/ranking/RankingBoard.tsx`
  - Only if they render rapper images directly.

**No Change**
- `public/rapper/*`
  - Do not continue relying on these files at runtime. They may remain in the repo temporarily until a later cleanup pass, but they are out of the first implementation scope unless the user explicitly requests deletion.

---

### Task 1: Confirm Framework Constraints Before Any Code Change

**Files:**
- Read: `node_modules/next/dist/docs/`
- Read: `AGENTS.md`
- Read: `docs\superpowers\plans\2026-05-16-oss-image-source-unification.md`

- [ ] Step 1: Read the relevant Next.js local guide for image and asset handling in this codebase version before editing any rendering code.
- [ ] Step 2: Reconfirm that no new upload flow, no database migration, and no OSS signing flow are in scope for this implementation.
- [ ] Step 3: Reconfirm that runtime compatibility with `/public/rapper/...` is intentionally removed in this phase.

### Task 2: Inventory All Rapper Image Consumers

**Files:**
- Read and possibly modify:
  - `src/components/rapper/RapperMediaPanel.tsx`
  - `src/components/rapper/RapperGallery.tsx`
  - `src/components/rapper/RapperSelector.tsx`
  - `src/components/rapper/CollapsibleRapperSelector.tsx`
  - `src/components/favorites/FavoritesPageClient.tsx`
  - `src/components/profile/EditableRatingsList.tsx`
  - `src/components/profile/FavoriteList.tsx`
  - Any additional files returned by `rg "avatarUrl|mediaUrl" src -n`

- [ ] Step 1: Search the repo for every consumer of `avatarUrl` and `mediaUrl`.
- [ ] Step 2: Classify each consumer as “primary media slot” or “avatar slot”.
- [ ] Step 3: Confirm whether any ranking components also render images and add them to the modification list if needed.

### Task 3: Define Final Rapper Image Contract

**Files:**
- Modify: `src/features/rappers/rapper.types.ts`
- Modify: `src/features/rappers/rapper.schema.ts`
- Test: `src/features/rappers/rapper.schema.test.ts`

- [ ] Step 1: Change the `Rapper` type so `avatarUrl` is optional.
- [ ] Step 2: Change the `Rapper` type so `mediaUrl` can represent a missing image without forcing a fake local path.
- [ ] Step 3: Update Zod validation so local `/...` image paths are rejected.
- [ ] Step 4: Restrict accepted non-empty image values to URL-shaped strings intended for OSS-hosted public assets.
- [ ] Step 5: Allow missing image values at schema level so the UI can render explicit placeholders.
- [ ] Step 6: Update schema tests to assert the new semantics instead of asserting a local `/rapper/...` path.

### Task 4: Introduce a Shared Image Resolution Module

**Files:**
- Create: `src/features/rappers/rapper.media.ts`
- Modify if needed: `src/features/rappers/rapper.types.ts`

- [ ] Step 1: Create one helper dedicated to resolving the primary display media for a rapper.
- [ ] Step 2: Create one helper dedicated to resolving the avatar image for a rapper, with fallback to `mediaUrl`.
- [ ] Step 3: Define a single shared placeholder configuration in the same module so all components render a consistent missing-image state.
- [ ] Step 4: Keep this module free of React component code so it stays reusable across server and client components.

### Task 5: Replace Seeded Local Placeholder Data

**Files:**
- Modify: `src/data/chinese-rappers.ts`
- Modify: `src/data/rappers.ts`
- Test: `src/features/rappers/rapper.schema.test.ts`

- [ ] Step 1: Remove the current `placeholderImage` seed value from `src/data/chinese-rappers.ts`.
- [ ] Step 2: Stop defaulting missing `imageUrl` values to a local SVG path inside seeded data.
- [ ] Step 3: Keep `avatarUrl` undefined when no dedicated avatar exists.
- [ ] Step 4: Keep `mediaUrl` undefined when no OSS media has been configured yet.
- [ ] Step 5: Replace every existing local `/rapper/...` path in both data files with either a public OSS URL or an explicit missing value.
- [ ] Step 6: Preserve all non-image rapper metadata unchanged during the migration.

### Task 6: Update Hero And Gallery Rendering

**Files:**
- Modify: `src/components/rapper/RapperMediaPanel.tsx`
- Modify: `src/components/rapper/RapperGallery.tsx`
- Possibly modify: `src/app/page.tsx`
- Possibly modify: `src/app/rank/[rapperId]/page.tsx`

- [ ] Step 1: Change the hero media panel to read image data through the shared primary-media resolver.
- [ ] Step 2: Render the shared placeholder treatment when the hero media is missing instead of rendering a broken `<img>`.
- [ ] Step 3: Keep the existing panel aspect ratio, overlay layers, and text layout unchanged when the placeholder is shown.
- [ ] Step 4: Change gallery cards to read image data through the shared primary-media resolver.
- [ ] Step 5: Render the same placeholder treatment in gallery cards when media is missing, preserving grayscale and hover behavior only for real images.

### Task 7: Update Avatar-Based UI Rendering

**Files:**
- Modify: `src/components/rapper/RapperSelector.tsx`
- Modify: `src/components/rapper/CollapsibleRapperSelector.tsx`
- Modify: `src/components/profile/EditableRatingsList.tsx`
- Modify: `src/components/profile/FavoriteList.tsx`
- Modify: `src/components/favorites/FavoritesPageClient.tsx`

- [ ] Step 1: Switch every avatar-sized UI consumer to the shared avatar resolver.
- [ ] Step 2: Ensure `avatarUrl` falls back to `mediaUrl` only through the shared resolver, not ad hoc component logic.
- [ ] Step 3: Render the shared placeholder visual when neither avatar nor media is available.
- [ ] Step 4: Preserve sizing, aspect ratio, and border radius so missing-image items do not shift layout.
- [ ] Step 5: Update favorite cards that use `mediaUrl` directly to the shared primary-media resolver so they match hero and gallery behavior.

### Task 8: Refresh Test Coverage For The New Rules

**Files:**
- Modify: `src/features/rappers/rapper.schema.test.ts`
- Create or modify if needed: `src/features/rappers/rapper.utils.test.ts`
- Optional create: `src/features/rappers/rapper.media.test.ts`

- [ ] Step 1: Add schema coverage that accepts OSS-style public URLs.
- [ ] Step 2: Add schema coverage that rejects local `/rapper/...` asset paths.
- [ ] Step 3: Add schema coverage that accepts missing image values for incomplete migration records.
- [ ] Step 4: Add media-resolver tests covering:
  - dedicated avatar present
  - avatar missing but media present
  - both missing so placeholder is required
- [ ] Step 5: Keep tests focused on data and helper behavior; do not broaden into unrelated UI snapshots unless needed by risk.

### Task 9: Verify The Static Dataset Against The New Contract

**Files:**
- Modify: `src/features/rappers/rapper.schema.test.ts`
- Read: `src/data/rappers.ts`
- Read: `src/data/chinese-rappers.ts`

- [ ] Step 1: Update dataset assertions so they no longer expect local asset paths.
- [ ] Step 2: Add an assertion that no parsed rapper record contains a `/rapper/` image path.
- [ ] Step 3: Add an assertion that unresolved image records remain parseable and are handled by the resolver strategy.
- [ ] Step 4: Keep the dataset-count assertions unless they fail for reasons unrelated to this migration.

### Task 10: Run Targeted Verification

**Files:**
- Verify: affected source and test files only

- [ ] Step 1: Run the focused rapper schema and media tests.
- [ ] Step 2: Run the full test suite if the focused tests pass.
- [ ] Step 3: Run `npm run typecheck`.
- [ ] Step 4: Run `npm run lint`.
- [ ] Step 5: Record any failures that come from pre-existing repository issues separately from migration regressions.

### Task 11: Manual UI Validation

**Files:**
- Review in browser:
  - `/`
  - `/rank/[rapperId]`
  - `/favorites`
  - `/ranking`

- [ ] Step 1: Open the home page and confirm cards with missing OSS media show placeholders without broken-image icons.
- [ ] Step 2: Open a rapper detail page with a configured OSS image and confirm the hero image still renders correctly.
- [ ] Step 3: Open a rapper detail page without configured OSS media and confirm the placeholder preserves layout and overlays.
- [ ] Step 4: Check favorites and editable ratings views for avatar fallback behavior.
- [ ] Step 5: Confirm no page still depends on local `public/rapper` files at runtime.

### Task 12: Optional Cleanup Pass

**Files:**
- Optional modify or delete later: `public/rapper/*`
- Optional modify: `README.md`

- [ ] Step 1: Decide whether local `public/rapper` files should remain temporarily in the repo or be deleted in a separate follow-up.
- [ ] Step 2: If the team wants documentation parity now, update project notes to state that rapper images are sourced from OSS and missing media shows placeholders.
- [ ] Step 3: Keep deletion of legacy assets out of the main migration change unless explicitly requested.

---

## Implementation Notes

- Do not add a user upload flow in this phase.
- Do not add image cropping in this phase.
- Do not migrate rapper data into a database in this phase.
- Do not add OSS client SDK usage in the frontend in this phase.
- Do not add signed URL logic; the bucket is public-read by design.
- Do not use `next/image` as part of this plan unless the relevant local Next.js guide explicitly supports the chosen remote-image setup and the migration effort remains narrow.
- Maintain existing visual style and layout behavior; only image-source logic and placeholder rendering should change.

---

## Spec Coverage Self-Review

- Covered: OSS becomes the only formal image source.
- Covered: Static TypeScript data remains the only data source.
- Covered: `avatarUrl` can be independently configured and falls back to `mediaUrl` when absent.
- Covered: No compatibility path to local `public/rapper` images remains in runtime behavior.
- Covered: Missing OSS images render explicit placeholders.
- Covered: Upload and cropping are explicitly deferred.
- No uncovered requirements remain from the approved design scope.

---

## IMPLEMENTATION CHECKLIST

1. [ ] Read the relevant local Next.js guide for this codebase version before editing image-rendering code.
2. [ ] Reconfirm that upload, cropping, database migration, and signed OSS URLs are out of scope.
3. [ ] Search the repo for every `avatarUrl` and `mediaUrl` consumer and finalize the affected-file list.
4. [ ] Update `src/features/rappers/rapper.types.ts` so `avatarUrl` is optional and image fields can represent missing OSS media.
5. [ ] Update `src/features/rappers/rapper.schema.ts` to reject local `/...` image paths and allow OSS URLs or missing values.
6. [ ] Create `src/features/rappers/rapper.media.ts` to centralize media resolution, avatar fallback, and placeholder metadata.
7. [ ] Remove local placeholder seeding from `src/data/chinese-rappers.ts`.
8. [ ] Replace local `/rapper/...` references in `src/data/rappers.ts` with OSS URLs or explicit missing values.
9. [ ] Replace local `/rapper/...` references in `src/data/chinese-rappers.ts` with OSS URLs or explicit missing values.
10. [ ] Update `src/components/rapper/RapperMediaPanel.tsx` to use the shared primary-media resolver and explicit placeholder rendering.
11. [ ] Update `src/components/rapper/RapperGallery.tsx` to use the shared primary-media resolver and explicit placeholder rendering.
12. [ ] Update `src/components/rapper/RapperSelector.tsx` to use the shared avatar resolver and explicit placeholder rendering.
13. [ ] Update `src/components/rapper/CollapsibleRapperSelector.tsx` to use the shared avatar resolver and explicit placeholder rendering.
14. [ ] Update `src/components/favorites/FavoritesPageClient.tsx` to use the shared primary-media resolver.
15. [ ] Update `src/components/profile/EditableRatingsList.tsx` to use the shared avatar resolver.
16. [ ] Update `src/components/profile/FavoriteList.tsx` to use the shared avatar resolver.
17. [ ] Add or update tests for OSS URL acceptance, local-path rejection, missing-image acceptance, and avatar/media fallback behavior.
18. [ ] Update dataset assertions so no parsed rapper record still exposes `/rapper/` runtime image paths.
19. [ ] Run focused rapper schema and media tests.
20. [ ] Run the full test suite.
21. [ ] Run `npm run typecheck`.
22. [ ] Run `npm run lint`.
23. [ ] Manually verify `/`, `/rank/[rapperId]`, `/favorites`, and `/ranking` for configured-image and missing-image cases.
24. [ ] Decide separately whether legacy `public/rapper` files should be documented as deprecated or deleted in a later cleanup change.

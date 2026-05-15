# Radar And Profile Layout Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the radar card information layout and rebuild the personal center into a 7:3 split with compact 3:4 favorite cards.

**Architecture:** Keep the existing component boundaries and only adjust JSX structure and Tailwind classes inside the affected UI components. Do not change stores, route navigation, rating calculation, favorite toggling, animation behavior, or data fetching.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, ECharts, GSAP, Zustand, TanStack Query.

---

## File Structure

- Modify `src/components/rapper/RapperRadarChart.tsx`
  - Responsible for radar card header, score display, orientation display, and chart layout.
  - Remove the awkward left-side orientation rail.
  - Replace the right-side metadata string with cleaner stacked or badge-style metadata.

- Modify `src/components/favorites/FavoritesPageClient.tsx`
  - Responsible for personal center page layout, stats, favorite cards, and rating list placement.
  - Change desktop split from current left-narrow/right-wide to left 7 / right 3.
  - Convert favorite cards into compact image-led cards with a 3:4 card ratio.

- Modify `src/components/profile/EditableRatingsList.tsx`
  - Responsible for the right-side rating record panel.
  - Make the list denser so it works as the 30% right column.

## Technical Specification

### Radar Card

- Keep `calculateOverallScore`, `formatScore`, `getPhRating`, and `normalizePhOrientation` usage unchanged.
- Keep `ReactECharts` option semantics unchanged except layout-related sizing if necessary.
- Replace the current two-column body layout `grid-cols-[70px_minmax(0,1fr)]` with a single chart-first layout.
- Move orientation information out of the left rail and into the header or a compact summary strip under the header.
- Show orientation as a concise badge or paired label, using `PH_ORIENTATION_LABELS[orientation]`.
- Show `PH_ORIENTATION_DESCRIPTIONS[orientation]` only if it fits in one compact line or can be visually de-emphasized without pushing the chart down.
- Replace `/ 5.0 · 18,640 ratings · 1-5` with a cleaner metadata grouping:
  - overall score remains visually primary;
  - `/ 5.0` becomes a small adjacent unit, not part of a long sentence;
  - rating count becomes a separate compact label;
  - `1-5` scale becomes a separate compact label or is removed from the header if it feels redundant.
- Keep `actionSlot` in the top-right area.
- Maintain radar chart minimum height close to the current compact target so the analysis page still fits better in the viewport.

### Personal Center

- Change desktop layout from `lg:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]` to a 7:3 split.
- Left 70% column contains:
  - stats row;
  - favorite card grid;
  - empty favorite state when applicable.
- Right 30% column contains:
  - `EditableRatingsList`.
- Mobile remains single column in the same order: header, stats/favorites, rating records.
- Favorite cards:
  - use `aspect-[3/4]`;
  - render as small visual cards rather than horizontal list rows;
  - show rapper image as the full card background or dominant top visual;
  - keep rapper name, region, score, top tags, and cancel favorite action;
  - keep `data-favorite-id` on each favorite card for the existing GSAP removal animation;
  - keep existing `Link` to `/rank/${rapper.id}`;
  - keep existing `removeFavoriteWithMotion(rapper.id)` button behavior.
- Favorite grid:
  - use multiple compact columns in the 70% left area;
  - avoid huge image cards;
  - maintain readable text without overlap.

### Rating Records Right Column

- `EditableRatingsList` should become more compact:
  - smaller container padding;
  - tighter header spacing;
  - smaller avatar;
  - tighter list item padding and gap;
  - button remains accessible and readable.
- Do not change `RatingDialog` props or `onChangeRating` behavior.
- Do not change the records derivation logic.

## Non-Goals

- Do not change rating formulas or PH orientation logic.
- Do not change route behavior.
- Do not change favorite add/remove state behavior.
- Do not change GSAP animation timing unless the new card structure requires only selector-compatible layout preservation.
- Do not introduce new dependencies.
- Do not convert images to `next/image` in this pass.

## Verification

- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npm run build`.
- Check `http://localhost:3000/rank/kendrick-lamar`.
- Check `http://localhost:3000/favorites`.
- Verify the radar card no longer has the left orientation rail.
- Verify radar score metadata is no longer a long `/ 5.0 · count · 1-5` line.
- Verify desktop personal center uses a left 7 / right 3 split.
- Verify favorite cards are 3:4 visual cards in the left column.
- Verify rating records are tighter in the right column.
- Verify mobile personal center remains single-column and has no text overlap.

## Implementation Tasks

### Task 1: Refine Radar Card Structure

**Files:**
- Modify `src/components/rapper/RapperRadarChart.tsx`

- [ ] Replace the current radar body grid that reserves a left orientation column with a chart-first structure.
- [ ] Move orientation label into a compact header summary or metadata strip.
- [ ] Keep score primary and attach `/ 5.0` as a small unit beside or below the score.
- [ ] Replace the long rating metadata line with separate compact labels for rating count and scale.
- [ ] Keep `actionSlot` in the top-right controls area.
- [ ] Confirm `PH_ORIENTATION_LABELS[orientation]` and `PH_ORIENTATION_DESCRIPTIONS[orientation]` remain valid and readable.
- [ ] Confirm `ReactECharts` still receives the same `option`, `notMerge`, `lazyUpdate`, and `key={rapper.id}` behavior.

### Task 2: Rebuild Personal Center Desktop Split

**Files:**
- Modify `src/components/favorites/FavoritesPageClient.tsx`

- [ ] Change the desktop grid to a 7:3 split.
- [ ] Keep mobile as a single-column grid.
- [ ] Keep stats and favorites in the left column.
- [ ] Keep `EditableRatingsList` in the right column.
- [ ] Preserve `PageHeader` usage and page-level padding.
- [ ] Preserve all existing hooks, memoized data, and handlers.

### Task 3: Convert Favorite Cards To 3:4 Visual Cards

**Files:**
- Modify `src/components/favorites/FavoritesPageClient.tsx`

- [ ] Replace current horizontal favorite card rows with compact visual cards.
- [ ] Add `aspect-[3/4]` to each favorite card.
- [ ] Make the rapper image the dominant visual area.
- [ ] Preserve `data-favorite-id={rapper.id}`.
- [ ] Preserve the `Link` destination to `/rank/${rapper.id}`.
- [ ] Preserve score display using `formatScore(calculateOverallScore(rapper.averageRatings))`.
- [ ] Preserve top tags using `rapper.tags.slice(0, 3)`.
- [ ] Preserve cancel favorite button and `removeFavoriteWithMotion(rapper.id)`.
- [ ] Ensure card text is truncated or constrained so it does not overflow.

### Task 4: Tighten Rating Records Panel

**Files:**
- Modify `src/components/profile/EditableRatingsList.tsx`

- [ ] Reduce panel padding one level.
- [ ] Reduce header title and spacing one level.
- [ ] Reduce record row padding and gap.
- [ ] Reduce avatar size one level.
- [ ] Keep `RatingDialog` props unchanged.
- [ ] Keep records mapping and empty state behavior unchanged.
- [ ] Ensure the panel fits the 30% right column without button text overflow.

### Task 5: Verify Scope And Behavior

**Files:**
- Review `src/components/rapper/RapperRadarChart.tsx`
- Review `src/components/favorites/FavoritesPageClient.tsx`
- Review `src/components/profile/EditableRatingsList.tsx`

- [ ] Confirm no changes were made to rating utilities.
- [ ] Confirm no changes were made to user store behavior.
- [ ] Confirm no changes were made to routing.
- [ ] Confirm no changes were made to curation behavior.
- [ ] Confirm no new dependencies were added.

### Task 6: Run Verification

**Commands:**
- `npm run lint`
- `npm run typecheck`
- `npm run build`

- [ ] Run lint and confirm there are no errors.
- [ ] Run typecheck and confirm it exits successfully.
- [ ] Run build and confirm it exits successfully.
- [ ] Use the existing dev server if available; otherwise start one without replacing an existing server.
- [ ] Check `/rank/kendrick-lamar`.
- [ ] Check `/favorites`.
- [ ] Report any remaining visual risk if screenshot tooling is unavailable.

IMPLEMENTATION CHECKLIST:
1. Modify `src/components/rapper/RapperRadarChart.tsx` to remove the left orientation rail and rebuild the header metadata into a compact layout.
2. Preserve the radar chart data, score calculation, and `actionSlot` behavior while tightening the card’s spacing.
3. Modify `src/components/favorites/FavoritesPageClient.tsx` to change the personal center to a 7:3 desktop split.
4. Rebuild the favorite area in `FavoritesPageClient.tsx` as compact `aspect-[3/4]` cards while keeping existing favorite removal behavior.
5. Modify `src/components/profile/EditableRatingsList.tsx` to make the right column denser and better suited to the 30% panel width.
6. Verify that no store, routing, scoring, or curation logic changed.
7. Run `npm run lint`.
8. Run `npm run typecheck`.
9. Run `npm run build`.
10. Check the affected pages in the browser and report any remaining layout risks.

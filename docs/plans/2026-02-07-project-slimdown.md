# Project Slimdown - Refactoring Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce the project folder weight and build size by removing dead code, unused assets, and misplaced dependencies - without changing any functionality.

**Architecture:** Pure cleanup refactor. No logic changes. Every deletion is verified by checking that no imports reference the removed file. Build must pass before and after every task.

**Tech Stack:** React 19 + Vite 7 + Tailwind 3

---

## Current State Analysis

| Category | Size | Details |
|----------|------|---------|
| **Total folder** | 298 MB | Dominated by node_modules (275 MB) |
| **Splash PNGs** | 2.7 MB | 8 splash-*.png files, **zero references** anywhere |
| **Build output** | 4.3 MB | dist/ folder (should be gitignored, already is) |
| **Dead source code** | ~4,800 lines | 17 files never imported by any page or component |
| **features-export chunk** | 430 KB | jspdf+xlsx bundle - jspdf is **orphaned** (never called from pages) |
| **tailwindcss in deps** | - | Build-only tool listed as runtime dependency |

### Dead Code Inventory (verified: zero imports from pages/components)

**Entire `src/data/calculators/` directory (6 files + 1 test):**
- `mei.js` (452 lines)
- `monophasicProducts.js` (423 lines)
- `ncmCalculations.js` (580 lines)
- `ncmDatabase.js` (455 lines)
- `stateICMS.js` (522 lines)
- `taxValidation.js` (595 lines)
- `__tests__/ncm.masterpiece.test.js` (554 lines)

**Entire `src/validation/` directory (2 files):**
- `taxValidation.js` (739 lines)
- `testesValidacao.js` (612 lines)

**Entire `src/utils/` directory (2 files):**
- `analytics.js` (not imported anywhere)
- `performance.js` (475 lines, not imported anywhere)

**`src/data/utils.js`** (467 lines, not imported anywhere)

**`src/services/pdfEngine.js`** (866 lines) + **`src/services/pdfTemplates.js`** (1,016 lines):
- pdfTemplates imports pdfEngine, but **no page or component imports either file**
- This means `jspdf` and `jspdf-autotable` packages are bundled but never executed

**`src/pages/LandingPage.jsx`** (480 lines):
- Not imported in App.jsx, not in any route, not referenced by any component

**`src/pwa/registerSW.js`**:
- Not imported in main.jsx or anywhere except the pwa/ directory itself
- No service worker file exists in public/
- (Note: `installPrompt.js` and `notifications.js` ARE used by PWAInstallPrompt.jsx and PWANotificationSetup.jsx - but those components themselves are never imported by App.jsx or any page. Need to verify.)

**Splash PNG images (8 files, 2.7 MB):**
- `public/icons/splash-*.png` - zero references in index.html, no manifest.json exists

### Misplaced Dependencies

These are build-only tools incorrectly in `dependencies` instead of `devDependencies`:
- `autoprefixer`
- `postcss`
- `tailwindcss`

---

## Pre-flight

### Task 0: Baseline build verification

**Files:** None modified

**Step 1: Run build and record output**

```bash
npm run build 2>&1 | tee /tmp/build-before.txt
```

Expected: Build succeeds. Record the chunk sizes for comparison.

**Step 2: Commit current state (if any uncommitted changes)**

Ensure working tree is clean before starting deletions.

---

## Phase 1: Remove Dead Source Files

### Task 1: Remove orphaned `src/data/calculators/` directory

**Files:**
- Delete: `src/data/calculators/mei.js`
- Delete: `src/data/calculators/monophasicProducts.js`
- Delete: `src/data/calculators/ncmCalculations.js`
- Delete: `src/data/calculators/ncmDatabase.js`
- Delete: `src/data/calculators/stateICMS.js`
- Delete: `src/data/calculators/taxValidation.js`
- Delete: `src/data/calculators/__tests__/ncm.masterpiece.test.js`

**Step 1: Verify no imports exist**

```bash
grep -r "calculators" src/ --include="*.jsx" --include="*.js" | grep -v "src/data/calculators/"
```

Expected: No results (already verified).

**Step 2: Delete the directory**

```bash
rm -rf src/data/calculators
```

**Step 3: Run build to verify nothing breaks**

```bash
npm run build
```

Expected: Build succeeds with identical output.

**Step 4: Commit**

```bash
git add -A src/data/calculators
git commit -m "chore: remove orphaned calculators directory (never imported)"
```

---

### Task 2: Remove orphaned `src/validation/` directory

**Files:**
- Delete: `src/validation/taxValidation.js`
- Delete: `src/validation/testesValidacao.js`

**Step 1: Verify no imports exist**

```bash
grep -r "validation" src/ --include="*.jsx" --include="*.js" | grep -v "src/validation/"
```

Expected: No results referencing these files.

**Step 2: Delete the directory**

```bash
rm -rf src/validation
```

**Step 3: Build verification**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add -A src/validation
git commit -m "chore: remove orphaned validation directory (never imported)"
```

---

### Task 3: Remove orphaned `src/utils/` directory

**Files:**
- Delete: `src/utils/analytics.js`
- Delete: `src/utils/performance.js`

**Step 1: Verify no imports exist**

```bash
grep -r "utils/analytics\|utils/performance" src/ --include="*.jsx" --include="*.js"
```

Expected: No results.

**Step 2: Delete the directory**

```bash
rm -rf src/utils
```

**Step 3: Build verification**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add -A src/utils
git commit -m "chore: remove orphaned utils directory (never imported)"
```

---

### Task 4: Remove orphaned `src/data/utils.js`

**Files:**
- Delete: `src/data/utils.js`

**Step 1: Verify no imports exist**

```bash
grep -r "data/utils" src/ --include="*.jsx" --include="*.js"
```

Expected: No results.

**Step 2: Delete**

```bash
rm src/data/utils.js
```

**Step 3: Build verification**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/data/utils.js
git commit -m "chore: remove orphaned data/utils.js (never imported)"
```

---

### Task 5: Remove orphaned PDF services and jspdf dependency

**Files:**
- Delete: `src/services/pdfEngine.js`
- Delete: `src/services/pdfTemplates.js`
- Modify: `package.json` (remove jspdf, jspdf-autotable)
- Modify: `vite.config.js` (remove features-export chunk entry for jspdf)

**Step 1: Verify no imports from pages/components**

```bash
grep -r "pdfEngine\|pdfTemplates\|PDFEngine" src/ --include="*.jsx" --include="*.js" | grep -v "src/services/"
```

Expected: No results.

**Step 2: Check if Relatorios.jsx uses jspdf directly**

```bash
grep -r "jspdf\|jsPDF" src/pages/ src/components/
```

Expected: No results (Relatorios uses browser print, not jsPDF).

**Step 3: Delete the service files**

```bash
rm src/services/pdfEngine.js src/services/pdfTemplates.js
```

If `src/services/` is now empty, delete the directory too:
```bash
rmdir src/services 2>/dev/null || true
```

**Step 4: Remove jspdf packages from package.json**

In `package.json`, remove these lines from `dependencies`:
```
"jspdf": "^4.1.0",
"jspdf-autotable": "^5.0.7",
```

**Step 5: Update vite.config.js manualChunks**

Change the `features-export` chunk from:
```js
'features-export': ['jspdf', 'jspdf-autotable', 'xlsx'],
```
to:
```js
'features-export': ['xlsx'],
```

**Step 6: Reinstall dependencies and build**

```bash
npm install && npm run build
```

Expected: Build succeeds. The `features-export` chunk should drop from ~430 KB to much smaller (xlsx only).

**Step 7: Commit**

```bash
git add src/services package.json package-lock.json vite.config.js
git commit -m "chore: remove orphaned PDF services and jspdf dependency

pdfEngine.js and pdfTemplates.js were never imported by any page.
Removes ~1,880 lines of dead code and ~430KB from bundle."
```

---

### Task 6: Remove orphaned LandingPage

**Files:**
- Delete: `src/pages/LandingPage.jsx`

**Step 1: Verify not imported**

```bash
grep -r "LandingPage" src/ --include="*.jsx" --include="*.js" | grep -v "src/pages/LandingPage.jsx"
```

Expected: No results.

**Step 2: Delete**

```bash
rm src/pages/LandingPage.jsx
```

**Step 3: Build verification**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/pages/LandingPage.jsx
git commit -m "chore: remove orphaned LandingPage (not in any route)"
```

---

### Task 7: Verify and remove orphaned PWA components

**Files (conditional - verify first):**
- Possibly delete: `src/pwa/registerSW.js`
- Possibly delete: `src/components/PWAInstallPrompt.jsx`
- Possibly delete: `src/components/PWANotificationSetup.jsx`

**Step 1: Check if PWA components are imported anywhere in App.jsx, main.jsx, or pages**

```bash
grep -r "PWAInstallPrompt\|PWANotificationSetup" src/ --include="*.jsx" --include="*.js" | grep -v "src/components/PWA"
```

**Step 2: Check if registerSW is imported anywhere outside pwa/**

```bash
grep -r "registerSW\|registerServiceWorker" src/ --include="*.jsx" --include="*.js" | grep -v "src/pwa/"
```

**Step 3: If both return no results, delete**

```bash
rm src/pwa/registerSW.js
rm src/components/PWAInstallPrompt.jsx
rm src/components/PWANotificationSetup.jsx
```

Note: Keep `installPrompt.js` and `notifications.js` ONLY if PWA components are kept. If PWA components are deleted, delete the entire `src/pwa/` directory.

**Step 4: Build verification**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add -A src/pwa src/components/PWA*
git commit -m "chore: remove orphaned PWA components (not mounted anywhere)"
```

---

## Phase 2: Remove Unused Assets

### Task 8: Remove unreferenced splash screen PNGs

**Files:**
- Delete: `public/icons/splash-828x1792.png`
- Delete: `public/icons/splash-1125x2436.png`
- Delete: `public/icons/splash-1170x2532.png`
- Delete: `public/icons/splash-1242x2688.png`
- Delete: `public/icons/splash-1284x2778.png`
- Delete: `public/icons/splash-1536x2048.png`
- Delete: `public/icons/splash-1668x2388.png`
- Delete: `public/icons/splash-2048x2732.png`

**Step 1: Verify no references**

```bash
grep -r "splash-" . --include="*.html" --include="*.json" --include="*.jsx" --include="*.js" --include="*.css" | grep -v node_modules | grep -v dist | grep -v .git
```

Expected: No results.

**Step 2: Delete**

```bash
rm public/icons/splash-*.png
```

**Step 3: Build verification**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add public/icons/splash-*.png
git commit -m "chore: remove 8 unused splash PNGs (2.7 MB, zero references)"
```

---

## Phase 3: Fix Dependencies

### Task 9: Move build-only tools to devDependencies

**Files:**
- Modify: `package.json`

**Step 1: Move autoprefixer, postcss, tailwindcss from dependencies to devDependencies**

In `package.json`, remove from `dependencies`:
```
"autoprefixer": "^10.4.24",
"postcss": "^8.5.6",
"tailwindcss": "^3.4.19",
```

Add to `devDependencies`:
```
"autoprefixer": "^10.4.24",
"postcss": "^8.5.6",
"tailwindcss": "^3.4.19",
```

**Step 2: Reinstall and build**

```bash
npm install && npm run build
```

Expected: Build succeeds identically.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: move build-only tools to devDependencies

autoprefixer, postcss, and tailwindcss are build tools, not runtime deps."
```

---

## Phase 4: Clean Up Stale Tests

### Task 10: Remove test files for deleted modules

**Files:**
- Delete: `src/data/__tests__/taxData.test.js` (if it only tests deleted calculators)
- Delete: `tests/taxCalculations.test.js` (if it only tests deleted code)

**Step 1: Read both test files to check what they test**

Read `src/data/__tests__/taxData.test.js` and `tests/taxCalculations.test.js`.

**Step 2: Decision**

- If the tests import from deleted files (calculators, validation, utils) -> delete them
- If the tests import from `taxData.js` or `taxHelpers.js` (which are ALIVE) -> KEEP them

**Step 3: Build and test verification**

```bash
npm run build && npm test -- --run 2>&1 | tail -20
```

**Step 4: Commit (if deletions made)**

```bash
git add -A tests/ src/data/__tests__/
git commit -m "chore: remove test files for deleted modules"
```

---

## Phase 5: Final Verification

### Task 11: Full build comparison and cleanup

**Step 1: Run final build**

```bash
npm run build 2>&1
```

**Step 2: Compare chunk sizes to baseline**

Expected improvements:
- `features-export` chunk: ~430 KB -> ~150 KB (xlsx only, no jspdf)
- Dead code no longer shipped
- 2.7 MB of splash PNGs removed from public/

**Step 3: Verify app works**

```bash
npm run dev
```

Navigate through all pages in browser. Every page should work identically.

**Step 4: Final summary commit (if any remaining cleanup)**

```bash
git log --oneline -10
```

Review the chain of commits for this refactor.

---

## Expected Impact

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Splash PNGs | 2.7 MB | 0 | -2.7 MB |
| Dead source code | ~4,800 lines | 0 | -4,800 lines |
| features-export chunk | 430 KB | ~150 KB | -280 KB |
| jspdf + jspdf-autotable in node_modules | ~5 MB | 0 | -5 MB |
| Build-tool misplacement | 3 packages wrong | Fixed | Correct semantics |

**Total: ~8+ MB removed, ~4,800 lines of dead code deleted, zero functionality lost.**

---

## Safety Rules

1. **NEVER delete a file without first verifying zero imports** (grep across entire src/)
2. **ALWAYS run `npm run build` after every deletion** - if it fails, undo immediately
3. **Commit after each task** - granular rollback if anything goes wrong
4. **Do NOT touch** any file that IS imported (taxData.js, taxHelpers.js, all page components, all mounted components)
5. **Do NOT refactor** working code - this plan is deletion-only

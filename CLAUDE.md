# CLAUDE.md - Edmonton Neighborhoods Rental Scores

## Project Overview
Interactive map-based dashboard showing Edmonton neighbourhoods with **quartile-based performance indicators** for crime, schools, and parks. Users hover to see a dark tooltip with rental prices and quartile rankings, or click neighbourhoods to see detailed stats in a right-side panel. Map-first interface with checkbox filtering controls.

**Key Design Principles:**
- **NO map markers** for schools/parks (data shown via quartile indicators only)
- **NO rent-based choropleth coloring** on map (neutral slate color for all neighbourhoods)
- **Quartile system**: 🔵 Best (top 25%) → 🟢 Good → 🟡 Fair → 🔴 Poor (bottom 25%)
- **Instant updates**: No "Apply Filters" button - changes happen immediately
- **Multiple unit type selection**: Checkboxes allow selecting multiple bedroom types simultaneously

## Repository & Deployment
- **GitHub Repo**: `essendigitalgroup-cyber/Edmonton-Neighborhoods-Rental-Scores`
- **Deployment**: GitHub Pages (auto-deploy on push to main)
- **Live URL**: `https://essendigitalgroup-cyber.github.io/Edmonton-Neighborhoods-Rental-Scores`

## Data Sources & Attribution
All datasets are **static, one-time only** (never updated after initial commit).

| Dataset | Source | Format | Freshness | Notes |
|---------|--------|--------|-----------|-------|
| **Crime Data** | Edmonton Police Service (EPS) | JSON | 12-month average (Jan-Dec 2025) | Violent crimes aggregated by neighbourhood |
| **Rent Data** | CMHC Rental Market Survey | JSON | October 2024 | Most recent official CMHC data available. Aggregated by CMHC zone (not neighbourhood) |
| **Schools** | Edmonton Public School Board (EPSB) | GeoJSON | Static | School locations + catchment areas |
| **Parks** | City of Edmonton Parks & Recreation | GeoJSON | Static | Park locations + types |
| **Neighbourhoods** | City of Edmonton | GeoJSON | Static | 406 Edmonton neighbourhoods with boundaries (simplified for performance) |

**Data Download Links (for reference only - already processed & in repo):**
- Crime: https://data.edmonton.ca/dataset/EPS-Neighbourhood-Criminal-Occurrences/xthe-mnvi
- Rent: https://communitydata.ca/data/cmhc-rental-market-survey-2025
- Schools: https://data.edmonton.ca/Externally-Sourced-Datasets/Edmonton-Public-School-Board-EPSB-_School-Catchmen/gc4g-ct3z
- Parks: https://data.edmonton.ca/Outdoor-Recreation/Playgrounds/9nqb-w48x
- Neighbourhoods: https://data.edmonton.ca/Geospatial-Boundaries/Neighbourhoods-and-Wards/gihh-utrc

## Critical Workflow Rules

### Before Starting Any Session
1. **Check current state**: `git pull origin main`
2. **Review project structure**: Never delete existing features without confirmation
3. **Confirm any design changes**: Ask before adding/removing UI elements

### Project Structure
```
/src
  ├── components/
  │   ├── Map.jsx              (Leaflet map with neighbourhood boundaries - NO MARKERS)
  │   ├── RightPanel.jsx       (Crime, rent, schools, parks stats with quartile indicators)
  │   ├── FilterControls.jsx   (Unit type checkboxes + data layer visibility toggles)
  │   ├── HoverTooltip.jsx     (Dark-themed tooltip following mouse cursor)
  │   ├── MapLegend.jsx        (Bottom-left legend showing quartile meanings)
  │   └── Header.jsx           (Title + subtitle)
  ├── context/
  │   └── AppContext.jsx       (Global state: selectedUnitTypes[], selectedNeighbourhood, visibleLayers)
  ├── data/
  │   ├── crime-data-processed.json      (12-month average by neighbourhood)
  │   ├── rent-data-processed.json       (by CMHC zone)
  │   ├── schools.geojson                (school locations)
  │   ├── parks.geojson                  (park locations)
  │   └── City_of_Edmonton_-_Neighbourhoods_20260117.geojson
  ├── utils/
  │   ├── dataLoader.js          (Load and parse JSON/GeoJSON, O(1) lookups via Maps)
  │   └── quartileCalculator.js  (Calculate quartile rankings for crime/schools/parks)
  ├── App.jsx                    (Main app container)
  └── main.jsx
/public
  ├── index.html
  └── (static assets if needed)
package.json
vite.config.js
tailwind.config.js
.github/workflows/deploy.yml    (GitHub Actions auto-deploy to Pages - MUST be at repo root)
CLAUDE.md                        (this file)
README.md                        (user-facing project description)
```

## Core Features & Interactions

### Map Interface (Primary)
- Display Edmonton neighbourhood boundaries as clickable/hoverable polygons
- **Neutral slate color (#e2e8f0)** for all neighbourhoods - NO rent-based coloring
- **NO map markers** for schools/parks - data shown only in tooltips/panels
- Highlight neighbourhood on hover (darker shade, thicker border)
- Show dark tooltip on hover with rent + quartile indicators
- Show full stats on click → right panel appears

### Dark Hover Tooltip (follows mouse cursor)
- **Position:** Near/follows mouse cursor (15px offset)
- **Theme:** Dark background (bg-slate-900), white text
- **Shows:**
  - Neighbourhood name (uppercase, bold)
  - Rent prices for ALL currently selected unit types
  - Quartile indicators:
    - 🔵 Crime level (lower is better)
    - 🔵 Schools availability (higher is better)
    - 🔵 Parks availability (higher is better)

### Right Panel (Secondary)
- **Shows when:** User clicks neighbourhood
- **Position:** Top-right, fixed width (384px)
- **NOT scrollable** - content fits within viewport
- **Displays:**
  - Neighbourhood name + X button (top-right) to close
  - Crime stats with quartile indicator (🔵🟢🟡🔴)
    - Total 2025 incidents
    - Monthly average
    - Quartile description
  - Market rental rates for ONLY selected unit types
    - Each unit type in blue card
    - NO percentages shown below prices
  - Schools with quartile indicator
  - Parks with quartile indicator + count
- **Refreshes** when different neighbourhood clicked

### Filter Controls (Top-Left)
**Position:** Absolute top-4 left-4 (NOT top-right)

**Unit Type Selection:**
- **Multiple selection via checkboxes** (NOT dropdown)
- Available types:
  - [ ] Studio
  - [ ] 1 Bedroom (DEFAULT: checked on load)
  - [ ] 2 Bedroom
  - [ ] 3+ Bedroom
- ❌ NO "Total Average" option
- At least one unit type must remain selected
- Updates happen INSTANTLY (no "Apply Filters" button)

**Data Layer Toggles:**
- [ ] Crime Data
- [ ] Rent Data
- [ ] Schools
- [ ] Parks

**⚠️ IMPORTANT - Z-Index Configuration:**
All overlays have `z-[1000]` or higher to stay above Leaflet map container (z-0).

### Map Legend (Bottom-Left)
- **Position:** Absolute bottom-6 left-6
- **Shows quartile meanings:**
  - 🔵 Best - Top 25%
  - 🟢 Good - Above Average
  - 🟡 Fair - Below Average
  - 🔴 Poor - Bottom 25%
- **Clarifies metrics:**
  - Crime: Lower is better
  - Schools/Parks: More is better

### Design Specifications
- **Style**: Professional, minimal, data-focused (no flashy animations)
- **Audience**: Senior real estate executives (LinkedIn-ready)
- **Color Scheme**:
  - Map: Neutral slate (#e2e8f0) for neighbourhoods
  - Tooltip: Dark theme (slate-900 background, white text)
  - Quartiles: 🔵 Blue (best) → 🟢 Green → 🟡 Yellow → 🔴 Red (worst)
  - Rent cards: Blue accent (blue-50 background, blue-900 text)

## Quartile Ranking System

**How It Works:**
- All neighbourhoods ranked into 4 tiers based on statistical quartiles (25th, 50th, 75th percentiles)
- **Crime:** Lower values = better ranking (🔵 = safest, 🔴 = most crime)
- **Schools:** Higher counts = better ranking (🔵 = most schools, 🔴 = fewest)
- **Parks:** Higher counts = better ranking (🔵 = most parks, 🔴 = fewest)

**Quartile Tiers:**
1. **🔵 Tier 1 (Best)** - Top 25% of neighbourhoods
2. **🟢 Tier 2 (Good)** - 25th-50th percentile
3. **🟡 Tier 3 (Fair)** - 50th-75th percentile
4. **🔴 Tier 4 (Poor)** - Bottom 25% of neighbourhoods

**Implementation:**
- Calculated once on data load via `quartileCalculator.js`
- Stored in Map data structures for O(1) lookups
- Exported functions: `getCrimeQuartile()`, `getSchoolsQuartile()`, `getParksQuartile()`

## Tech Stack
- **Framework**: React 19.2.0 + Vite 7.3.1
- **Styling**: Tailwind CSS v4 with @tailwindcss/postcss
- **Mapping**: Leaflet 1.9.4 (for interactive neighbourhood boundaries)
- **State Management**: React Context API with useMemo/useCallback optimization
- **Build & Deploy**: GitHub Pages + GitHub Actions

## GitHub Pages Deployment

### Vite Config for GitHub Pages
```javascript
// vite.config.js
export default {
  base: '/Edmonton-Neighborhoods-Rental-Scores/',
  // ... rest of config
}
```

### GitHub Actions Workflow
File: `.github/workflows/deploy.yml`
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Deploy Workflow
1. Make changes locally
2. Test with `npm run dev`
3. Commit: `git add . && git commit -m "[FEATURE] Description"`
4. Push: `git push origin main`
5. GitHub Actions automatically builds & deploys to Pages (no manual intervention needed)
6. Live at: `https://essendigitalgroup-cyber.github.io/Edmonton-Neighborhoods-Rental-Scores`

## Data File Sizes & Performance Notes

| File | Size | Notes |
|------|------|-------|
| crime-data.json | ~5-8 MB | 12-month aggregated data, all 406 neighbourhoods |
| rent-data.json | ~500 KB | CMHC zones only (~12 zones) |
| schools.json | ~60 KB | 259 schools |
| parks.json | ~125 KB | 668 playgrounds |
| neighbourhoods.geojson | ~500 KB | Simplified boundary polygons (8 MB → 500 KB via Mapshaper) |
| **Total** | ~6.5 MB | Well within GitHub Pages 1 GB limit |

**Performance Optimization:**
- All data loaded on app initialization (small enough for instant load)
- Neighbourhood boundary simplification done via Mapshaper before commit
- Leaflet lazy-renders map tiles (no performance hit)

## Commands Reference

```bash
# Install dependencies
npm install

# Local dev server
npm run dev

# Build for production
npm run build

# Check what will be deployed
npm run preview

# Git workflow
git status
git add .
git commit -m "[FEATURE] Description"
git push origin main
```

## Session Start Checklist
1. `git pull origin main` (check for any changes)
2. Confirm which feature/bug we're working on
3. Start local dev: `npm run dev`
4. Make changes
5. Test in browser (`localhost:5173` or similar)
6. Push to main → auto-deploy to GitHub Pages

## Important Notes
- **This is a one-time project**: No ongoing data updates. All datasets frozen after initial commit.
- **Map-first UX**: Users primarily interact via map hover tooltips, not data tables
- **Zone-level rent data**: Rent prices are aggregated by CMHC zone, not individual neighbourhood. Tooltips/panels show the zone's rent data when user hovers/clicks any neighbourhood in that zone.
- **Performance optimized**: O(1) data lookups via Map data structures, quartiles calculated once on load
- **GitHub Actions workflow**: MUST be at repository root `.github/workflows/deploy.yml` (NOT in subdirectory)

## Design Answers (Confirmed)
1. ✅ GitHub Pages workflow set up at repository root
2. ✅ Checkbox-based unit type selector (NOT dropdown)
3. ✅ Multiple unit types can be selected simultaneously
4. ✅ Default state: 1 bedroom selected
5. ✅ Dark-themed hover tooltip following mouse cursor
6. ✅ Quartile indicators: 🔵🟢🟡🔴 for crime/schools/parks
7. ✅ NO map markers for schools/parks
8. ✅ NO rent-based choropleth coloring (neutral slate only)
9. ✅ NO "Apply Filters" button (instant updates)
10. ✅ NO "Total Average" unit type option

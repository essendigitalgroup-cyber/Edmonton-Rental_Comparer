# CLAUDE.md - Edmonton Neighborhoods Rental Scores

## Project Overview
Interactive map-based dashboard showing Edmonton neighbourhoods with overlaid data on crime, rental prices, schools, and parks. Users click/hover on neighbourhoods to see detailed stats in a right-side panel. Map-first interface with filtering controls.

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
  │   ├── Map.jsx              (Leaflet map with neighbourhood boundaries)
  │   ├── RightPanel.jsx       (Crime, rent, schools, parks stats)
  │   ├── FilterControls.jsx   (Checkboxes for data layer visibility)
  │   └── Header.jsx           (Title + subtitle)
  ├── data/
  │   ├── crime-data.json      (12-month average by neighbourhood)
  │   ├── rent-data.json       (by CMHC zone)
  │   ├── schools.json         (locations + catchment areas)
  │   ├── parks.json           (locations + types)
  │   └── neighbourhoods.geojson (simplified boundaries + zone mapping)
  ├── utils/
  │   ├── dataLoader.js        (Load and parse JSON/GeoJSON)
  │   ├── zoneMapper.js        (Map neighbourhoods to CMHC zones for rent lookup)
  │   └── dataAggregators.js   (Filter schools/parks by neighbourhood)
  ├── App.jsx                  (Main app container)
  ├── App.css                  (Tailwind + custom styles)
  └── main.jsx
/public
  ├── index.html
  └── (static assets if needed)
package.json
vite.config.js
tailwind.config.js
.github/workflows/deploy.yml  (GitHub Actions auto-deploy to Pages)
CLAUDE.md                      (this file)
README.md                      (user-facing project description)
```

## Core Features & Interactions

### Map Interface (Primary)
- Display Edmonton neighbourhood boundaries as clickable/hoverable polygons
- Highlight neighbourhood on hover
- Show full stats on click → right panel appears

### Right Panel (Secondary)
- **Shows when:** User clicks neighbourhood or hovers within a zone
- **Sticky rent data:** When user hovers within a CMHC zone, rent prices stay displayed as cursor moves through neighbourhoods in that zone (since rent is zone-level, not neighbourhood-level)
- **Displays:**
  - Neighbourhood name
  - Crime stats (violent crimes - 12-month average)
  - Rent prices (by bedroom type: bachelor, 1-bed, 2-bed, 3-bed+ - for the zone this neighbourhood belongs to)
  - Schools (list of schools in/near neighbourhood)
  - Parks (count and list of parks)

### Filter Controls (Top of Page)
- Checkboxes to toggle visibility:
  - [ ] Crime Data
  - [ ] Rent Data
  - [ ] Schools
  - [ ] Parks
  - [ ] Neighbourhood Boundaries (always on)

**⚠️ IMPORTANT - Z-Index Configuration:**
Since Leaflet maps often "steal" mouse focus or overlap UI elements, ensure your `FilterControls.jsx` and `RightPanel.jsx` components have a `z-[1000]` or higher in Tailwind to stay above the Leaflet map container.

**Global State - Unit Type Selection:**
The "Active Unit Type" (Bachelor, 1-bed, 2-bed, 3-bed+) and "Building Type" (Condo vs. House) should be managed as **global state**. When the user changes from "1-Bed" to "2-Bed", the choropleth colors on the map should update **instantly** to reflect the rent prices for that specific category. This ensures the map visualization remains synchronized with the selected filter criteria.

### Design Specifications
- **Style**: Professional, minimal, data-focused (no flashy animations)
- **Audience**: Senior real estate executives (LinkedIn-ready)
- **Design file**: Will be provided separately to Claude Code

## Tech Stack
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet (for interactive neighbourhood boundaries)
- **Data Visualization**: Recharts (for crime/rent charts in right panel) or D3 (for custom viz)
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
- **Map-first UX**: Users primarily interact via map, not data tables
- **Zone-level rent data**: Rent prices are aggregated by CMHC zone, not individual neighbourhood. Right panel shows the zone's rent data when user hovers/clicks any neighbourhood in that zone.
- **Browser-only Claude Code**: No OS-specific instructions needed. All development in browser.
- **Design separately**: UI/UX designs will be provided to Claude Code directly (not in this doc).

## Questions for Claude Code
Before starting, Claude should confirm:
1. "Should I set up the GitHub Pages deployment workflow now, or wait for the first commit?"
2. "Do you have the design file ready, or should I create placeholder styling with Tailwind?"
3. "Any specific chart/visualization preference for crime and rent data in the right panel?"

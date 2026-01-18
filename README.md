# Edmonton Neighbourhoods Rental Scores

Interactive map-based dashboard showing Edmonton neighbourhoods with overlaid data on crime, rental prices, schools, and parks.

## 🚨 Current Status: Data Collection Phase

This repository contains **data files only** - the React application has not been built yet.

### ✅ What's in the Repo

| File | Status | Size | Notes |
|------|--------|------|-------|
| **City_of_Edmonton_-_Neighbourhoods_20260117.csv** | ✅ Complete | 2.7 MB | 406 Edmonton neighbourhoods |
| **City_of_Edmonton_-_Neighbourhoods_20260117.geojson** | ✅ Complete | 2.9 MB | Neighbourhood boundaries for map |
| **Edmonton_Public_School_Board__EPSB__School_Catchment_Areas_and_School_Locations.csv** | ✅ Complete | 1.5 MB | 259 schools with locations |
| **Playgrounds.csv** | ✅ Complete | 181 KB | 668 playgrounds across Edmonton |
| **crime-data.json** | ⚠️ PLACEHOLDER | 4 KB | Sample structure - needs real data |
| **rent-data.json** | ⚠️ PLACEHOLDER | 6 KB | Sample structure - needs real data |
| **CLAUDE.md** | ✅ Complete | - | Developer documentation |

### ❌ Git Metadata Files Removed

The following files were **removed** from the repository (they were git internal files that should never be committed):
- `HEAD`, `config`, `description`
- `hooks/` folder
- `info/` folder

## 🎯 Next Steps

### 1. Obtain Real Crime Data

**Source:** Edmonton Police Service (EPS) - Neighbourhood Criminal Occurrences

**How to get it:**

1. **Via Socrata API** (Recommended):
   ```bash
   # Fetch violent crimes for 2025
   curl "https://openperformance.edmonton.ca/resource/xthe-mnvi.json?\$where=reported_year=2025%20AND%20ucr_crime_category%20like%20'%25Crimes%20Against%20Persons%25'&\$limit=50000" > raw-crime-data.json
   ```

2. **Via Web Portal**:
   - Visit: [EPS Neighbourhood Criminal Occurrences](https://dashboard.edmonton.ca/dataset/EPS-Neighbourhood-Criminal-Occurrences/xthe-mnvi/data)
   - Filter for violent crimes (Crimes Against Persons)
   - Download as JSON
   - Aggregate by neighbourhood (12-month average)

3. **Data Processing Required**:
   - Filter for violent crimes only
   - Aggregate by neighbourhood
   - Calculate 12-month averages
   - Match structure in `crime-data.json` placeholder

**Required Fields:**
- `neighbourhood_name` (string)
- `neighbourhood_number` (string)
- `violent_crimes_12mo_avg` (number)

### 2. Obtain Real Rent Data

**Source:** Canada Mortgage and Housing Corporation (CMHC) Rental Market Survey

**How to get it:**

1. **Via Community Data Program** (Paid):
   - Visit: [CMHC Rental Market Survey 2024](https://communitydata.ca/data/cmhc-rental-market-survey-2024)
   - Download CSV (7.9 MB)
   - Filter for Edmonton zones
   - Convert to JSON format

2. **Via CMHC Portal** (Free but manual):
   - Visit: [Primary Rental Market Statistics - Edmonton](https://www03.cmhc-schl.gc.ca/hmip-pimh/en/Profile?geoId=0340&t=3&a=6)
   - Navigate to zone-level data
   - Export rent by bedroom type
   - Manually structure into JSON

3. **Via CMHC Data Tables**:
   - Visit: [CMHC Rental Market Data Tables](https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market/rental-market-report-data-tables)
   - Download Excel files
   - Filter for Edmonton
   - Convert to JSON format

**Required Structure:**
```json
{
  "cmhc_zones": [
    {
      "zone_id": "zone_1",
      "zone_name": "Zone Name",
      "neighbourhoods": ["NEIGHBOURHOOD_1", "NEIGHBOURHOOD_2"],
      "rent_by_unit_type": {
        "bachelor": { "average_rent": 995 },
        "1_bedroom": { "average_rent": 1285 },
        "2_bedroom": { "average_rent": 1595 },
        "3_bedroom_plus": { "average_rent": 1895 }
      }
    }
  ]
}
```

### 3. Convert Schools & Parks to GeoJSON

Currently, schools and parks are in CSV format. For optimal map performance, convert to GeoJSON:

**Schools:**
```bash
# Using ogr2ogr (GDAL tools)
ogr2ogr -f GeoJSON schools.geojson Edmonton_Public_School_Board__EPSB__School_Catchment_Areas_and_School_Locations.csv \
  -oo X_POSSIBLE_NAMES=Longitude -oo Y_POSSIBLE_NAMES=Latitude
```

**Parks:**
```bash
ogr2ogr -f GeoJSON parks.geojson Playgrounds.csv \
  -oo X_POSSIBLE_NAMES=Longitude -oo Y_POSSIBLE_NAMES=Latitude
```

Or use online converters like [geojson.io](https://geojson.io/) or [MyGeodata](https://mygeodata.cloud/converter/csv-to-geojson).

## 📚 Data Sources & Attribution

| Dataset | Source | License | Last Updated |
|---------|--------|---------|--------------|
| Neighbourhoods | [City of Edmonton Open Data](https://data.edmonton.ca/Geospatial-Boundaries/Neighbourhoods-and-Wards/gihh-utrc) | Open Government License | Jan 17, 2026 |
| Schools | [Edmonton Public School Board](https://data.edmonton.ca/Externally-Sourced-Datasets/Edmonton-Public-School-Board-EPSB-_School-Catchmen/gc4g-ct3z) | Open | 2021 |
| Parks | [City of Edmonton Parks](https://data.edmonton.ca/Outdoor-Recreation/Playgrounds/9nqb-w48x) | Open Government License | Static |
| Crime | [EPS Open Data](https://dashboard.edmonton.ca/dataset/EPS-Neighbourhood-Criminal-Occurrences/xthe-mnvi/data) | Open | Ongoing |
| Rent | [CMHC](https://www.cmhc-schl.gc.ca/) | Licensed (requires attribution) | Oct 2024 |

## 🛠️ Technical Details

**Target Tech Stack** (not yet implemented):
- React + Vite
- Tailwind CSS
- Leaflet (mapping)
- Recharts or D3 (visualizations)

**Deployment:** GitHub Pages (auto-deploy from main branch)

**Live URL (future):** `https://essendigitalgroup-cyber.github.io/Edmonton-Neighborhoods-Rental-Scores`

## 📖 Documentation

See [CLAUDE.md](./CLAUDE.md) for complete developer documentation including:
- Project structure
- Feature specifications
- Z-Index handling for Leaflet maps
- Global state management for unit type selection
- Deployment workflow

## 🔗 Useful Links

**Crime Data:**
- [EPS Neighbourhood Criminal Occurrences](https://dashboard.edmonton.ca/dataset/EPS-Neighbourhood-Criminal-Occurrences/xthe-mnvi/data)
- [Community Safety Data Portal](https://communitysafetydataportal.edmontonpolice.ca/)
- [Socrata API Documentation](https://dev.socrata.com/consumers/getting-started.html)

**Rent Data:**
- [CMHC Housing Market Information Portal](https://www03.cmhc-schl.gc.ca/hmip-pimh/en/Profile?geoId=0340&t=3&a=6)
- [Community Data Program - CMHC Survey](https://communitydata.ca/data/cmhc-rental-market-survey-2024)
- [CMHC Data Tables](https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market)

## 📝 Notes

- This is a **one-time static project** - data will not be updated after initial collection
- All 406 Edmonton neighbourhoods are included in the neighbourhood boundary files
- Crime data aggregates violent crimes (assault, robbery, sexual assault, homicide)
- Rent data is zone-level (not neighbourhood-level) - typically 10-12 zones across Edmonton
- Map choropleth colors should update instantly when user switches bedroom types (bachelor → 1-bed → 2-bed, etc.)
- FilterControls and RightPanel components must use `z-[1000]` or higher to stay above Leaflet map

## 📄 License

Data licenses vary by source (see table above). Application code will be licensed separately when developed.

---

**Questions?** See [CLAUDE.md](./CLAUDE.md) for detailed developer guidance.

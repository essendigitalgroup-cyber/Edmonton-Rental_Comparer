# Edmonton Neighbourhoods Rental Scores Dashboard

Interactive map-based dashboard showing Edmonton neighbourhoods with crime statistics, rental prices, schools, and parks.

## Features

- **Interactive Map**: Leaflet map with 406 Edmonton neighbourhood boundaries
- **Choropleth Visualization**: Neighbourhoods color-coded by rent prices (green = affordable, red = expensive)
- **Real-time Filtering**: Switch between unit types (Studio, 1BR, 2BR, 3BR+) and map colors update instantly
- **Detailed Stats Panel**: Click any neighbourhood to see:
  - Violent/weapons crime statistics (2025 data)
  - Rental prices by bedroom type (CMHC October 2024)
  - Parks and playgrounds count
- **Layer Toggles**: Show/hide crime data, rent data, schools, and parks
- **252 School Markers**: Edmonton Public School Board locations
- **662 Park Markers**: Playground locations across Edmonton

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **Leaflet** + **React-Leaflet** for interactive maps
- **Recharts** for data visualization
- **Context API** for global state management

## Local Development

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Header.jsx           # App header
│   ├── Map.jsx              # Leaflet map with neighbourhoods, schools, parks
│   ├── FilterControls.jsx   # Unit type selector + layer toggles
│   └── RightPanel.jsx       # Stats display panel
├── context/
│   └── AppContext.jsx       # Global state (unit type, selected neighbourhood)
├── data/
│   ├── crime-data-processed.json        # Crime stats by neighbourhood
│   ├── rent-data-processed.json         # Rent by bedroom type
│   ├── schools.geojson                  # School locations
│   ├── parks.geojson                    # Park locations
│   └── neighbourhoods.geojson           # Neighbourhood boundaries
├── utils/
│   └── dataLoader.js        # Data loading utilities
├── App.jsx                  # Main app component
└── index.css                # Global styles + Tailwind
```

## Data Sources

All data is static (one-time snapshot, not updated):

- **Crime Data**: Edmonton Police Service (EPS) Community Safety Data Portal
  - 8,838 violent/weapons incidents (2025)
  - Aggregated by neighbourhood with 12-month averages
- **Rent Data**: Canada Mortgage and Housing Corporation (CMHC)
  - October 2024 Rental Market Survey
  - 64 neighbourhoods with bedroom-type breakdown
- **Schools**: Edmonton Public School Board (EPSB) - 252 schools
- **Parks**: City of Edmonton - 662 playgrounds
- **Neighbourhoods**: City of Edmonton - 406 neighbourhood boundaries

## Deployment

The app is configured for GitHub Pages deployment:

- Base path: `/Edmonton-Rental_Comparer/`
- Automatic deployment via GitHub Actions on push to `main`
- Workflow file: `.github/workflows/deploy.yml`

## Key Implementation Details

### Z-Index Handling

- `FilterControls` and `RightPanel` use `z-[1000]` to stay above the Leaflet map (z-0)
- Ensures overlays remain clickable and visible

### Global State Management

- Unit type selection is global state
- Map choropleth colors update instantly when unit type changes
- No page reload needed for filter updates

### Async Data Loading

- Large GeoJSON files loaded asynchronously via `fetch()`
- Loading spinner displayed until data is ready
- All data cached in memory after initial load

## License

Data sources have varying licenses - see main repository README for details.

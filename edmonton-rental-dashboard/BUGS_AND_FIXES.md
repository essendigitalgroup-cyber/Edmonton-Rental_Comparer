# 🐛 Code Review: Bugs & Improvements Found

## Critical Issues (Must Fix)

### 1. **RACE CONDITION in dataLoader.js** ⚠️ HIGH PRIORITY
**Location:** `src/utils/dataLoader.js:21`

**Issue:**
```javascript
if (!crimeData) {  // Multiple calls can enter here simultaneously
  const [crime, rent, ...] = await Promise.all([...])
}
```

**Problem:** If multiple components call `loadAllData()` simultaneously (before the first completes), they will all pass the `if (!crimeData)` check and trigger duplicate fetch requests.

**Impact:**
- Wasted bandwidth (loading 3.9MB of data multiple times)
- Race condition: last-finished call wins
- Potential for incomplete data if one fetch fails

**Fix:**
```javascript
let loadingPromise = null;

export const loadAllData = async () => {
  if (crimeData) {
    return { crime: crimeData, rent: rentData, ... };
  }

  if (!loadingPromise) {
    loadingPromise = Promise.all([...]).then(([crime, rent, ...]) => {
      crimeData = crime;
      rentData = rent;
      // ...
      return { crime, rent, ... };
    }).catch(error => {
      loadingPromise = null; // Reset on error
      throw error;
    });
  }

  return loadingPromise;
};
```

---

### 2. **NO ERROR HANDLING for fetch failures** ⚠️ HIGH PRIORITY
**Location:** `src/utils/dataLoader.js:22-28`

**Issue:** If ANY fetch fails, entire app breaks with no user-friendly error message.

**Problem:**
- Network failures show generic browser error
- Malformed JSON crashes with no recovery
- User sees blank screen or infinite loading

**Fix:** Add proper error handling:
```javascript
try {
  const response = await fetch(crimeDataUrl);
  if (!response.ok) {
    throw new Error(`Failed to load crime data: ${response.status}`);
  }
  const data = await response.json();
  // Validate data structure
  if (!data.crime_by_neighbourhood || !Array.isArray(data.crime_by_neighbourhood)) {
    throw new Error('Invalid crime data structure');
  }
  return data;
} catch (error) {
  console.error('Data loading error:', error);
  // Return fallback or show error UI
}
```

---

### 3. **PERFORMANCE: O(n²) in Map rendering** 🔴 CRITICAL
**Location:** `src/components/Map.jsx:56`

**Issue:**
```javascript
const getNeighbourhoodStyle = (feature) => {
  const rentData = getRentByNeighbourhood(neighbourhoodName);  // O(n) find
  // ... called for 406 neighbourhoods = O(n²)
};
```

**Problem:**
- `getRentByNeighbourhood()` does a `.find()` through rent array (O(n))
- This is called for EVERY neighbourhood (406 times)
- **Total: 406 × 64 = 25,984 iterations** just to render the map!
- Happens on EVERY re-render and activeUnitType change

**Impact:** Noticeable lag when switching unit types

**Fix:** Build a Map lookup once:
```javascript
// In dataLoader.js
let rentDataMap = null;

export const buildRentLookup = () => {
  if (!rentData || rentDataMap) return;

  rentDataMap = new Map();
  rentData.rent_by_neighbourhood.forEach(entry => {
    rentDataMap.set(entry.neighbourhood_name.toUpperCase(), entry);
  });
};

export const getRentByNeighbourhood = (neighbourhoodName) => {
  if (!rentDataMap) buildRentLookup();
  return rentDataMap?.get(neighbourhoodName.toUpperCase()) || null;
};
```

**Result:** O(n²) → O(n) lookup

---

### 4. **Icon Memory Leak** ⚠️ MEDIUM PRIORITY
**Location:** `src/components/Map.jsx:107, 119`

**Issue:**
```javascript
const Map = () => {
  const schoolIcon = new L.Icon({ ... });  // Created on EVERY render
  const parkIcon = new L.Icon({ ... });
```

**Problem:** Icons recreated on every component render, causing unnecessary memory allocations.

**Fix:** Move outside component or use useMemo:
```javascript
const schoolIcon = useMemo(() => new L.Icon({...}), []);
const parkIcon = useMemo(() => new L.Icon({...}), []);
```

---

## Medium Priority Issues

### 5. **AppContext re-renders all consumers**
**Location:** `src/context/AppContext.jsx:36`

**Issue:**
```javascript
const value = {  // New object on every render
  activeUnitType,
  setActiveUnitType,
  // ...
};
```

**Problem:** Value object recreated on every AppProvider render, triggering re-renders of all consumers even if values haven't changed.

**Fix:**
```javascript
const value = useMemo(() => ({
  activeUnitType,
  setActiveUnitType,
  selectedNeighbourhood,
  setSelectedNeighbourhood,
  visibleLayers,
  toggleLayer
}), [activeUnitType, selectedNeighbourhood, visibleLayers]);
```

---

### 6. **Misleading UX text in RightPanel**
**Location:** `src/components/RightPanel.jsx:11`

**Issue:**
```javascript
<p>Click or hover over a neighbourhood to see details</p>
```

**Problem:** Text says "hover" but hovering doesn't actually select a neighbourhood - only clicking does.

**Fix:**
```javascript
<p>Click on a neighbourhood to see details</p>
```

---

### 7. **No way to close/deselect neighbourhood**
**Location:** `src/components/RightPanel.jsx`

**Issue:** Once a neighbourhood is selected, user can't deselect it except by selecting another.

**Fix:** Add close button:
```javascript
<div className="flex justify-between items-start mb-4">
  <h2 className="text-2xl font-bold">{neighbourhoodName}</h2>
  <button
    onClick={() => setSelectedNeighbourhood(null)}
    className="text-slate-400 hover:text-slate-600"
    aria-label="Close panel"
  >
    ✕
  </button>
</div>
```

---

## Accessibility Issues

### 8. **Missing ARIA labels**
**Location:** `src/components/RightPanel.jsx:30`

**Fix:**
```javascript
<div
  className="..."
  role="complementary"
  aria-label="Neighbourhood information panel"
>
```

### 9. **Missing keyboard navigation**
**Location:** `src/components/Map.jsx`

**Issue:** Map interactions are mouse-only, not keyboard accessible.

**Note:** This is a Leaflet limitation and would require significant work to fix properly.

---

## Low Priority / Nice to Have

### 10. **No data validation**
**Location:** All data loader functions

**Issue:** No runtime validation that fetched data matches expected structure.

**Suggestion:** Add validation library (e.g., Zod) or manual checks:
```javascript
if (!data.crime_by_neighbourhood) {
  throw new Error('Missing crime_by_neighbourhood in data');
}
```

### 11. **Console.error in production**
**Location:** `src/components/Map.jsx:36`

**Issue:** `console.error()` left in production code.

**Fix:** Use proper error tracking service or remove.

### 12. **Magic numbers for color thresholds**
**Location:** `src/components/Map.jsx:48-52`

**Issue:** Hardcoded rent thresholds (1200, 1350, etc.) without explanation.

**Fix:** Move to constants with comments:
```javascript
const RENT_THRESHOLDS = {
  VERY_LOW: 1200,   // Below average for Edmonton
  LOW: 1350,        // Slightly below average
  AVERAGE: 1500,    // City average
  HIGH: 1650,       // Above average
  // Above 1650 is considered very high
};
```

---

## Summary

### Must Fix Before Deploy:
1. ✅ Race condition in loadAllData()
2. ✅ Error handling for fetch failures
3. 🔴 **CRITICAL:** Performance issue with O(n²) lookups

### Should Fix Soon:
4. Icon memory leak (useMemo)
5. AppContext optimization (useMemo)
6. UX text ("hover" is misleading)
7. Add close button for panel

### Nice to Have:
8-12. Accessibility, validation, constants

---

## Estimated Impact

**If we fix items 1-3:**
- ✅ Prevent duplicate data fetches (save ~3.9MB × N concurrent loads)
- ✅ Graceful error handling (better UX)
- ✅ **50-80% faster** map color updates when switching unit types

**Time to fix:** ~30-45 minutes

**Risk:** Low - these are straightforward fixes

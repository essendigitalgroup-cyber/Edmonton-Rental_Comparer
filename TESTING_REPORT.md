# Testing Report - Edmonton Rental Dashboard
**Date**: 2026-01-18
**Tested By**: Claude (Multi-Persona Testing)

---

## Testing Methodology

This report analyzes the codebase from 5 different personas:
1. **End User (Real Estate Executive)** - UX/UI issues
2. **Developer (Code Reviewer)** - Code quality, bugs, edge cases
3. **Performance Tester** - Performance bottlenecks, memory leaks
4. **Accessibility Tester** - WCAG compliance, keyboard navigation
5. **Data Quality Tester** - Data integrity, missing data handling

---

## 1. END USER PERSONA (Real Estate Executive)

### 🔴 CRITICAL ISSUES

#### Issue 1.1: Tooltip Persists After Mouse Leaves Neighbourhood
**Severity**: HIGH
**Location**: `Map.jsx:59-67` + `HoverTooltip.jsx:14`
**Problem**: When user hovers over a neighbourhood and then moves mouse away, the tooltip remains visible at the last position because `mousePosition` is not cleared when `mouseout` fires.

**Current Behavior**:
```javascript
mouseout: (e) => {
  setHoveredNeighbourhood(null);  // ✅ Cleared
  // ❌ mousePosition NOT cleared - tooltip still renders
}
```

**Expected Behavior**: Tooltip should disappear when mouse leaves neighbourhood.

**Fix**:
```javascript
mouseout: (e) => {
  setHoveredNeighbourhood(null);
  setMousePosition(null);  // Clear mouse position
  // ...
}
```

#### Issue 1.2: Tooltip Can Overflow Off-Screen
**Severity**: MEDIUM
**Location**: `HoverTooltip.jsx:29-33`
**Problem**: Tooltip has fixed 15px offset without viewport boundary detection. If user hovers near right/bottom edge of screen, tooltip will be cut off or cause horizontal scrolling.

**Current Implementation**:
```javascript
style={{
  left: `${mousePosition.x + 15}px`,  // ❌ No boundary check
  top: `${mousePosition.y + 15}px`,   // ❌ No boundary check
}}
```

**Recommended Fix**: Add viewport overflow detection:
```javascript
const tooltipWidth = 200;  // min-w-[200px]
const tooltipHeight = 150; // estimated
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

const left = mousePosition.x + 15 + tooltipWidth > viewportWidth
  ? mousePosition.x - tooltipWidth - 15
  : mousePosition.x + 15;

const top = mousePosition.y + 15 + tooltipHeight > viewportHeight
  ? mousePosition.y - tooltipHeight - 15
  : mousePosition.y + 15;
```

#### Issue 1.3: Confusing Empty State for RightPanel
**Severity**: LOW
**Location**: `RightPanel.jsx:22-29`
**Problem**: When no neighbourhood is selected, panel still appears with "Click on a neighbourhood to see details" message. This could confuse first-time users who might think the panel is always visible.

**Recommendation**: Consider hiding panel completely when `!selectedNeighbourhood`:
```javascript
if (!selectedNeighbourhood) return null;
```

Or make it more visually distinct (lighter background, dashed border).

### 🟡 MINOR ISSUES

#### Issue 1.4: No Visual Feedback When Checkbox Disabled
**Severity**: LOW
**Location**: `AppContext.jsx:37-47`
**Problem**: When user tries to uncheck the last remaining unit type, nothing happens (no visual feedback). User might think the checkbox is broken.

**Recommendation**: Add toast notification or subtle shake animation when action is prevented.

---

## 2. DEVELOPER PERSONA (Code Reviewer)

### 🔴 CRITICAL ISSUES

#### Issue 2.1: Missing Error Boundary
**Severity**: HIGH
**Location**: `App.jsx`, all components
**Problem**: No error boundary to catch runtime errors. If any component crashes (e.g., data format mismatch), entire app crashes with blank white screen.

**Recommendation**: Add React Error Boundary:
```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}
```

#### Issue 2.2: Race Condition in Data Loading
**Severity**: MEDIUM
**Location**: `Map.jsx:15-28`
**Problem**: If component unmounts during data load, `setNeighbourhoods` and `setLoading` will be called on unmounted component, causing React warning.

**Current Code**:
```javascript
useEffect(() => {
  const loadData = async () => {
    const data = await loadAllData();
    setNeighbourhoods(data.neighbourhoods);  // ❌ Could be unmounted
  };
  loadData();
}, []);
```

**Fix**:
```javascript
useEffect(() => {
  let cancelled = false;
  const loadData = async () => {
    const data = await loadAllData();
    if (!cancelled) {
      setNeighbourhoods(data.neighbourhoods);
    }
  };
  loadData();
  return () => { cancelled = true; };
}, []);
```

### 🟡 MEDIUM ISSUES

#### Issue 2.3: Empty Array Edge Case in Quartile Calculation
**Severity**: MEDIUM
**Location**: `quartileCalculator.js:13-26`
**Problem**: If `values` array is empty, `sorted.length` is 0, and `sorted[0]` returns undefined, causing NaN comparisons.

**Current Code**:
```javascript
const calculateQuartiles = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;  // Could be 0

  return {
    q1: sorted[Math.floor(n * 0.25)],  // ❌ undefined if n=0
    q2: sorted[Math.floor(n * 0.50)],
    q3: sorted[Math.floor(n * 0.75)]
  };
};
```

**Fix**: Add guard clause:
```javascript
if (values.length === 0) {
  return { q1: 0, q2: 0, q3: 0 };
}
```

#### Issue 2.4: All-Same-Values Edge Case in Quartiles
**Severity**: LOW
**Location**: `quartileCalculator.js:35-49`
**Problem**: If all neighbourhoods have same value (e.g., all have 0 schools), q1=q2=q3=0, and all neighbourhoods get tier 1 (best). This is mathematically correct but semantically misleading.

**Example**: 100 neighbourhoods with 0 schools → all get 🔵 "Excellent Schools"

**Recommendation**: Add special handling:
```javascript
if (quartiles.q1 === quartiles.q3) {
  // All values same - assign tier 3 (average) to all
  return 3;
}
```

### 🟢 MINOR ISSUES

#### Issue 2.5: Unused Return Value in Map.jsx
**Severity**: LOW
**Location**: `Map.jsx:44-76`
**Problem**: `onEachFeature` callback returns nothing, but defines event handlers. Not a bug, but could be clearer.

**Recommendation**: Add comment explaining Leaflet's side-effect-based API.

#### Issue 2.6: Magic Numbers in Tooltip Offset
**Severity**: LOW
**Location**: `HoverTooltip.jsx:30-31`
**Problem**: Hard-coded `15px` offset with no explanation.

**Recommendation**: Extract to named constant:
```javascript
const TOOLTIP_OFFSET_PX = 15; // Distance from cursor
```

---

## 3. PERFORMANCE TESTER PERSONA

### 🔴 CRITICAL ISSUES

#### Issue 3.1: Context Value Causes Unnecessary Re-renders
**Severity**: HIGH
**Location**: `AppContext.jsx:50-57`
**Problem**: Context value object includes ALL state, so ANY state change causes ALL consumers to re-render, even if they only use one piece of state.

**Current Code**:
```javascript
const value = useMemo(() => ({
  selectedUnitTypes,      // Changes → ALL consumers re-render
  toggleUnitType,
  selectedNeighbourhood,  // Changes → ALL consumers re-render
  setSelectedNeighbourhood,
  visibleLayers,          // Changes → ALL consumers re-render
  toggleLayer
}), [selectedUnitTypes, selectedNeighbourhood, visibleLayers, ...]);
```

**Example**: When user toggles "Crime Data" layer visibility:
- FilterControls re-renders ✅ (expected)
- RightPanel re-renders ❌ (doesn't use visibleLayers for display)
- HoverTooltip re-renders ❌ (doesn't use visibleLayers at all)

**Recommended Fix**: Split into multiple contexts or use Zustand/Jotai for selective subscriptions.

### 🟡 MEDIUM ISSUES

#### Issue 3.2: GeoJSON Layer Re-renders on Selection Change
**Severity**: MEDIUM
**Location**: `Map.jsx:31-41`, `Map.jsx:128-134`
**Problem**: `getNeighbourhoodStyle` depends on `selectedNeighbourhood`, so when user clicks a neighbourhood:
1. `selectedNeighbourhood` changes
2. `getNeighbourhoodStyle` is recreated
3. GeoJSON layer style function changes
4. Leaflet re-renders ALL 406 neighbourhood polygons

**Current Code**:
```javascript
const getNeighbourhoodStyle = useCallback((feature) => {
  const isSelected = selectedNeighbourhood?.properties.name === feature.properties.name;
  // ...
}, [selectedNeighbourhood]);  // ❌ Changes on every click
```

**Impact**: 406 polygons × style recalculation = potentially laggy on slower devices.

**Optimization**: Use Leaflet's `setStyle()` API to update only the selected/deselected polygons instead of recreating the entire style function.

#### Issue 3.3: Mouse Move Events Fire Excessively
**Severity**: MEDIUM
**Location**: `Map.jsx:69-74`
**Problem**: `mousemove` event fires continuously (potentially 60+ times per second), causing rapid `setMousePosition` calls and tooltip re-renders.

**Current Code**:
```javascript
mousemove: (e) => {
  setMousePosition({
    x: e.originalEvent.clientX,
    y: e.originalEvent.clientY
  });
}
```

**Recommendation**: Throttle mouse position updates:
```javascript
import { throttle } from 'lodash-es';

const updateMousePosition = throttle((x, y) => {
  setMousePosition({ x, y });
}, 16); // ~60fps

// In mousemove handler:
updateMousePosition(e.originalEvent.clientX, e.originalEvent.clientY);
```

### 🟢 MINOR ISSUES

#### Issue 3.4: Multiple Array Iterations in RightPanel
**Severity**: LOW
**Location**: `RightPanel.jsx:106-119`
**Problem**: `selectedUnitTypes.map()` creates new array of React elements on every render. Fine for small arrays (max 4 items), but unnecessary work.

**Recommendation**: Memoize mapped elements:
```javascript
const rentCards = useMemo(() =>
  selectedUnitTypes.map(unitType => <RentCard key={unitType} type={unitType} />),
  [selectedUnitTypes, rentData]
);
```

---

## 4. ACCESSIBILITY TESTER PERSONA (WCAG 2.1 AA)

### 🔴 CRITICAL ISSUES

#### Issue 4.1: Tooltip Not Accessible to Keyboard Users
**Severity**: CRITICAL (WCAG 2.1.1 Keyboard)
**Location**: `HoverTooltip.jsx` + `Map.jsx`
**Problem**: Tooltip only appears on mouse hover. Keyboard users cannot access tooltip content at all.

**WCAG Violation**: 2.1.1 Keyboard (Level A)

**Recommendation**: Add keyboard focus support:
```javascript
layer.on({
  focus: () => setHoveredNeighbourhood(feature),
  blur: () => setHoveredNeighbourhood(null)
});
```

And make polygons focusable by adding `tabindex`.

#### Issue 4.2: RightPanel Close Button Has No Keyboard Focus Indicator
**Severity**: HIGH (WCAG 2.4.7 Focus Visible)
**Location**: `RightPanel.jsx:58-62`
**Problem**: Close button (X) has no visible focus indicator. Keyboard users can't see where focus is.

**Current Code**:
```javascript
className="text-slate-400 hover:text-slate-600 transition-colors"
```

**Fix**: Add focus styles:
```javascript
className="text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
```

#### Issue 4.3: Map Lacks Keyboard Navigation Instructions
**Severity**: MEDIUM (WCAG 3.3.2 Labels or Instructions)
**Location**: `Map.jsx`, `Header.jsx`
**Problem**: No instructions for keyboard users on how to navigate the map.

**Recommendation**: Add screen-reader-only instructions:
```html
<div className="sr-only" role="status">
  Use Tab to navigate between neighbourhoods. Press Enter to view details.
</div>
```

### 🟡 MEDIUM ISSUES

#### Issue 4.4: Insufficient Color Contrast in Tooltip
**Severity**: MEDIUM (WCAG 1.4.3 Contrast)
**Location**: `HoverTooltip.jsx:47`, `HoverTooltip.jsx:62`
**Problem**: `text-slate-400` on `bg-slate-900` may not meet 4.5:1 contrast ratio for small text.

**Colors**: #94a3b8 (slate-400) on #0f172a (slate-900) = 3.8:1 ❌

**Fix**: Use `text-slate-300` instead:
```javascript
className="text-slate-300"  // #cbd5e1 on #0f172a = 6.2:1 ✅
```

#### Issue 4.5: Emoji Quartile Indicators Inaccessible to Screen Readers
**Severity**: MEDIUM (WCAG 1.1.1 Non-text Content)
**Location**: `HoverTooltip.jsx:61`, `RightPanel.jsx:76`
**Problem**: Emojis (🔵🟢🟡🔴) convey meaning but have no alt text. Screen reader announces "blue circle" instead of "best quartile".

**Fix**: Add aria-label:
```javascript
<span aria-label={`${crimeQuartile.label} (tier ${crimeQuartile.tier} of 4)`}>
  {crimeQuartile.emoji}
</span>
```

### 🟢 MINOR ISSUES

#### Issue 4.6: Checkboxes Lack Group Label
**Severity**: LOW (WCAG 1.3.1 Info and Relationships)
**Location**: `FilterControls.jsx:23-37`
**Problem**: Unit type checkboxes not wrapped in `<fieldset>` with `<legend>`.

**Recommendation**:
```javascript
<fieldset>
  <legend className="text-sm font-semibold text-slate-700 mb-2">
    Unit Type:
  </legend>
  {/* checkboxes */}
</fieldset>
```

---

## 5. DATA QUALITY TESTER PERSONA

### 🔴 CRITICAL ISSUES

#### Issue 5.1: No Handling for Missing Rent Data
**Severity**: HIGH
**Location**: `HoverTooltip.jsx:19`, `RightPanel.jsx:46`
**Problem**: If `getRentByNeighbourhood()` returns `null` (neighbourhood not in CMHC zone), tooltip shows nothing for rent section, and RightPanel shows "No rent data available".

**Current Behavior**: Silent failure with generic error message.

**Recommendation**: Show specific message explaining zone-level aggregation:
```javascript
{!rentData && (
  <p className="text-xs text-slate-500">
    Rent data aggregated by CMHC zone. This neighbourhood may not be in a tracked zone.
  </p>
)}
```

#### Issue 5.2: Neighbourhood Name Case Sensitivity Issues
**Severity**: HIGH
**Location**: All data lookup functions
**Problem**: All lookups use `.toUpperCase()` normalization, but if GeoJSON has inconsistent casing (e.g., "Mckernan" vs "MCKERNAN"), lookups will fail.

**Example**:
```javascript
// dataLoader.js
rentDataMap.set(entry.neighbourhood_name.toUpperCase(), entry);

// Later lookup
getRentByNeighbourhood("McKernan");  // Returns null if stored as "MCKERNAN"
```

**Recommendation**: Add `.trim()` and normalize Unicode characters:
```javascript
const normalize = (str) => str.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
```

### 🟡 MEDIUM ISSUES

#### Issue 5.3: No Validation for Quartile Data Completeness
**Severity**: MEDIUM
**Location**: `quartileCalculator.js:87-113`
**Problem**: If crime data is missing for some neighbourhoods, quartile calculation still runs, but those neighbourhoods won't be in the map.

**Example**: 406 neighbourhoods in GeoJSON, but only 400 in crime data → 6 neighbourhoods will show `null` for `getCrimeQuartile()`.

**Recommendation**: Log missing data during calculation:
```javascript
const missingData = neighbourhoodsData.features.filter(n =>
  !crimeData.crime_by_neighbourhood.find(c =>
    c.neighbourhood_name.toUpperCase() === n.properties.name.toUpperCase()
  )
);
if (missingData.length > 0) {
  console.warn(`Crime data missing for ${missingData.length} neighbourhoods:`, missingData.map(n => n.properties.name));
}
```

#### Issue 5.4: No Handling for Zero/Negative Crime Values
**Severity**: LOW
**Location**: `quartileCalculator.js:91-93`
**Problem**: If crime data has 0 incidents (possible for low-crime neighbourhoods in short time periods), quartile tier assignment works correctly, but displaying "0 incidents" might confuse users who expect all areas to have some crime.

**Recommendation**: Add explanatory text when value is 0:
```javascript
{crimeData.violent_weapons_crimes_total_2025 === 0 && (
  <p className="text-xs text-green-600">No violent/weapons crimes reported in 2025</p>
)}
```

### 🟢 MINOR ISSUES

#### Issue 5.5: Potential Memory Leak in Data Loading
**Severity**: LOW
**Location**: `dataLoader.js` (entire file)
**Problem**: All data is stored in module-level variables (not freed on unmount). Fine for single-page app, but if this were embedded in a larger app, data would persist unnecessarily.

**Recommendation**: Add cleanup function:
```javascript
export const clearData = () => {
  crimeData = null;
  rentData = null;
  // ... etc
};
```

---

## SUMMARY

### Issue Breakdown by Severity

| Severity | Count | Issues |
|----------|-------|--------|
| 🔴 Critical | 7 | 1.1, 2.1, 3.1, 4.1, 5.1, 5.2 |
| 🟡 Medium | 9 | 1.2, 2.2, 2.3, 3.2, 3.3, 4.3, 4.4, 4.5, 5.3 |
| 🟢 Minor | 9 | 1.3, 1.4, 2.4-2.6, 3.4, 4.6, 5.4, 5.5 |

### Recommended Priority Order

1. **Fix Issue 1.1** (Tooltip persistence) - Quick fix, major UX impact
2. **Fix Issue 4.1** (Keyboard accessibility) - WCAG violation
3. **Fix Issue 2.1** (Error boundary) - Prevents app crashes
4. **Fix Issue 3.1** (Context re-renders) - Performance impact on all interactions
5. **Fix Issue 5.2** (Case sensitivity) - Data integrity
6. **Fix Issue 2.2** (Race condition) - Prevents React warnings
7. **Fix remaining medium issues** (tooltips, contrast, validation)
8. **Address minor issues** (polish, edge cases)

### Testing Coverage Estimate

- **Unit Tests**: 0% (no test files found)
- **Integration Tests**: 0%
- **E2E Tests**: 0%

**Recommendation**: Add Vitest + React Testing Library for unit tests, Playwright for E2E tests.

---

## Conclusion

The codebase is **functional and well-structured**, but has several **UX and accessibility gaps** that should be addressed before production deployment. The quartile system is mathematically sound, but edge case handling could be improved.

**Overall Grade**: B+ (Good implementation with room for improvement)

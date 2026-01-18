
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const geojsonPath = path.join(__dirname, '../data/City_of_Edmonton_-_Neighbourhoods_20260117.geojson');
const rentPath = path.join(__dirname, '../data/rent-data-processed.json');
const outputPath = path.join(__dirname, '../data/neighbourhood-to-rent-zone.json');

try {
    const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
    const rentData = JSON.parse(fs.readFileSync(rentPath, 'utf8'));
    const rentZones = rentData.rent_by_neighbourhood.map(r => r.neighbourhood_name);

    const mapping = {};
    let mappedCount = 0;

    geojson.features.forEach(f => {
        const name = f.properties.name.toUpperCase();
        const district = (f.properties.district || '').toUpperCase();

        // 1. Exact Match
        if (rentZones.includes(name)) {
            mapping[name] = name;
            mappedCount++;
            return;
        }

        // 2. Substring Match (Zone contains Name)
        // e.g. Zone "HIGHLANDS/ALBERTA AVENUE" contains "ALBERTA AVENUE"
        const containingZone = rentZones.find(z => z.includes(name));
        if (containingZone) {
            mapping[name] = containingZone;
            mappedCount++;
            return;
        }

        // 3. Reverse Substring (Name contains Zone)
        // e.g. "WEST JASPER PLACE" contains "JASPER PLACE" (riskier, check carefully)
        // Skipped to avoid false positives

        // 4. District Heuristics
        if (district === 'JASPER PLACE') {
            mapping[name] = 'WEST JASPER PLACE/RURAL';
            mappedCount++;
        } else if (district === 'MILL WOODS AND MEADOWS') {
            mapping[name] = 'CENTRAL MILLWOODS'; // Representative
            mappedCount++;
        } else if (district === 'SOUTHWEST') {
            mapping[name] = 'TERWILLEGAR/RURAL SOUTHWEST';
            mappedCount++;
        } else if (district === 'NORTHEAST') {
            mapping[name] = 'NORTH EAST';
            mappedCount++;
        } else if (district === 'NORTHWEST') {
            mapping[name] = 'NORTH WEST JASPER PLACE'; // Best guess
            mappedCount++;
        } else if (district === 'SCONA') {
            mapping[name] = 'UNIVERSITY'; // Scona is near Uni area
            mappedCount++;
        } else if (district === 'CENTRAL') {
            mapping[name] = 'DOWNTOWN'; // Fallback for central
            mappedCount++;
        } else if (district === 'NORTH CENTRAL') {
            mapping[name] = 'NORTH CENTRAL (WEST)'; // Representative
            mappedCount++;
        } else {
            // Fallback to City Average
            mapping[name] = 'EDMONTON';
            mappedCount++;
        }
    });

    fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
    console.log(`Generated mapping for ${mappedCount} neighbourhoods.`);
    console.log(`File saved to: ${outputPath}`);

} catch (err) {
    console.error(err);
}

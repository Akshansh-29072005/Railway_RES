import json
import sys

def point_in_bbox(lon, lat):
    return 80.00 <= lon <= 82.50 and 19.50 <= lat <= 22.25

def load_and_filter(filepath):
    print("Loading GeoJSON...")
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    features = data.get('features', [])
    print(f"Total features: {len(features)}")
    
    filtered_features = []
    stations = []
    
    for f in features:
        props = f.get('properties', {})
        geom = f.get('geometry', {})
        
        # Check BBOX (approx based on first coordinate)
        coords = geom.get('coordinates', [])
        if not coords: continue
        
        first_coord = coords[0] if geom['type'] != 'Polygon' else coords[0][0]
        # Handle multi-level coords for MultiLineString etc.
        while isinstance(first_coord, list) and len(first_coord) > 0 and isinstance(first_coord[0], list):
            first_coord = first_coord[0]
            
        if isinstance(first_coord, list) and len(first_coord) >= 2:
            lon, lat = first_coord[0], first_coord[1]
            if not point_in_bbox(lon, lat):
                continue
        
        # Check if station
        if props.get('railway') in ['station', 'halt']:
            stations.append(f)
            continue
            
        # Check track filters
        rw = props.get('railway')
        valid_rw = rw in ['rail', 'narrow_gauge', 'yard', 'siding', 'spur', 'crossover']
        
        # Operator/Zone filter
        operator = str(props.get('operator', '')).upper()
        zone = str(props.get('zone', '')).upper()
        valid_op = 'SECR' in operator or 'SOUTH EAST CENTRAL RAILWAY' in operator or 'SECR' in zone
        
        if valid_rw:
            # Let's see if operator tag is strictly required. Often OSM misses operator tags on rails.
            # If we enforce it strictly, we might get 0 tracks. Let's include it in the output for inspection.
            filtered_features.append(f)

    print(f"Features within BBOX matching railway type: {len(filtered_features)}")
    print(f"Stations within BBOX: {len(stations)}")
    
    # Check operator constraint
    secr_features = []
    for f in filtered_features:
        props = f.get('properties', {})
        operator = str(props.get('operator', '')).upper()
        zone = str(props.get('zone', '')).upper()
        if 'SECR' in operator or 'SOUTH EAST CENTRAL RAILWAY' in operator or 'SECR' in zone:
            secr_features.append(f)
            
    print(f"Features matching operator strictly: {len(secr_features)}")
    
    secr_stations = []
    for f in stations:
        props = f.get('properties', {})
        operator = str(props.get('operator', '')).upper()
        zone = str(props.get('zone', '')).upper()
        # Stations usually have better tags, but let's check
        if 'SECR' in operator or 'SOUTH EAST CENTRAL RAILWAY' in operator or 'SECR' in zone:
            secr_stations.append(f)
            
    print(f"Stations matching operator strictly: {len(secr_stations)}")
    
    # Save a small subset to analyze tags
    with open('filtered_subset.json', 'w') as out:
        json.dump({
            "tracks": [f['properties'] for f in filtered_features[:50]], 
            "stations": [f['properties'] for f in stations[:50]]
        }, out, indent=2)

if __name__ == '__main__':
    load_and_filter('/home/akshansh/Railway_RES/GeoData/export (1).geojson')

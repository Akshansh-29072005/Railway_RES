import json
import math
import heapq

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def process():
    print("Loading data...")
    with open('GeoData/export (1).geojson') as f:
        data = json.load(f)
        
    features = data.get('features', [])
    graph = {}
    node_coords = {}
    stations = []
    
    # 1. First pass to find stations
    for f in features:
        props = f.get('properties', {})
        geom = f.get('geometry', {})
        if props.get('railway') in ['station', 'halt']:
            # Try to get coordinates
            coords = geom.get('coordinates', [])
            if geom['type'] == 'Point':
                stations.append({
                    'name': props.get('name', 'Unknown'),
                    'lat': coords[1],
                    'lon': coords[0]
                })
            elif geom['type'] == 'Polygon':
                # approx center
                lat = coords[0][0][1]
                lon = coords[0][0][0]
                stations.append({
                    'name': props.get('name', 'Unknown'),
                    'lat': lat,
                    'lon': lon
                })

    print(f"Found {len(stations)} stations.")
    for s in stations:
        if any(n in s['name'].upper() for n in ['DADHAPARA', 'BHATAPARA', 'TILDA', 'RAIPUR', 'BHILAI', 'DURG', 'MARAUDA', 'ABHANPUR', 'BALOD', 'DALLIRAJHARA']):
            print(f"Key station: {s['name']}")

    # 2. Build graph from ways
    ways = 0
    for f in features:
        props = f.get('properties', {})
        geom = f.get('geometry', {})
        
        rw = props.get('railway')
        valid_rw = rw in ['rail', 'narrow_gauge', 'yard', 'siding', 'spur', 'crossover']
        if not valid_rw:
            continue
            
        coords = geom.get('coordinates', [])
        if geom['type'] == 'LineString':
            ways += 1
            for i in range(len(coords) - 1):
                p1 = tuple(coords[i])
                p2 = tuple(coords[i+1])
                node_coords[p1] = p1
                node_coords[p2] = p2
                if p1 not in graph: graph[p1] = set()
                if p2 not in graph: graph[p2] = set()
                graph[p1].add(p2)
                graph[p2].add(p1)

    print(f"Built graph from {ways} ways with {len(node_coords)} nodes.")

process()

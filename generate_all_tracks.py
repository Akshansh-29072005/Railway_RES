import json

def process():
    print("Loading OSM JSON data...")
    with open('GeoData/export (1).json', 'r') as f:
        data = json.load(f)
        
    elements = data.get('elements', [])
    nodes = {}
    
    for el in elements:
        if el['type'] == 'node':
            nodes[el['id']] = (el['lat'], el['lon'])
            
    all_tracks = []
    yards_sidings = []
    
    for el in elements:
        if el['type'] == 'way':
            tags = el.get('tags', {})
            rw = tags.get('railway')
            if rw in ['rail', 'narrow_gauge']:
                nd_refs = el.get('nodes', [])
                
                # Filter to only the Raipur-Durg bounding box area
                coords = []
                inside = False
                for n in nd_refs:
                    if n in nodes:
                        lat, lon = nodes[n]
                        coords.append([lat, lon])
                        if 20.5 <= lat <= 22.2 and 81.0 <= lon <= 82.2:
                            inside = True
                
                if inside and len(coords) > 1:
                    service = tags.get('service')
                    # If it has a service tag like yard, siding, spur, crossover, etc.
                    if service in ['yard', 'siding', 'spur', 'crossover', 'safety_siding', 'sand_drag']:
                        yards_sidings.append(coords)
                    else:
                        # Standard main tracks have no service tag or a different one
                        all_tracks.append(coords)
                        
    print(f"Extracted {len(all_tracks)} main track segments and {len(yards_sidings)} yard/siding segments.")
    
    with open('all_tracks_processed.json', 'w') as f:
        json.dump({"MAIN_TRACKS": all_tracks, "YARD_TRACKS": yards_sidings}, f)

if __name__ == '__main__':
    process()

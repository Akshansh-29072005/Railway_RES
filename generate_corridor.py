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

def find_closest_node(lat, lon, nodes_dict):
    closest = None
    min_dist = float('inf')
    for nid, (nlat, nlon) in nodes_dict.items():
        # Quick bounding box check
        if abs(nlat - lat) > 0.1 or abs(nlon - lon) > 0.1: continue
        dist = haversine(lat, lon, nlat, nlon)
        if dist < min_dist:
            min_dist = dist
            closest = nid
    return closest

def dijkstra(graph, start, end, nodes_dict):
    queue = [(0, start, [])]
    seen = set()
    while queue:
        (cost, node, path) = heapq.heappop(queue)
        if node in seen: continue
        seen.add(node)
        path = path + [node]
        if node == end:
            return path
        for next_node in graph.get(node, []):
            if next_node in seen: continue
            dist = haversine(nodes_dict[node][0], nodes_dict[node][1], nodes_dict[next_node][0], nodes_dict[next_node][1])
            heapq.heappush(queue, (cost + dist, next_node, path))
    return []

def main():
    print("Loading OSM JSON data...")
    with open('GeoData/export (1).json', 'r') as f:
        data = json.load(f)
        
    elements = data.get('elements', [])
    nodes = {}
    
    print("Parsing nodes...")
    for el in elements:
        if el['type'] == 'node':
            nodes[el['id']] = (el['lat'], el['lon'])
            
    print(f"Total nodes: {len(nodes)}")
    
    graph = {}
    valid_ways = []
    
    for el in elements:
        if el['type'] == 'way':
            tags = el.get('tags', {})
            rw = tags.get('railway')
            if rw in ['rail', 'narrow_gauge', 'yard', 'siding', 'spur', 'crossover']:
                nd_refs = el.get('nodes', [])
                valid_ways.append((nd_refs, tags))
                for i in range(len(nd_refs) - 1):
                    n1, n2 = nd_refs[i], nd_refs[i+1]
                    if n1 in nodes and n2 in nodes:
                        graph.setdefault(n1, set()).add(n2)
                        graph.setdefault(n2, set()).add(n1)
                        
    print(f"Built graph with {len(graph)} connected nodes.")
    
    # Approx station coordinates
    target_stations = {
        'Dadhapara': (22.0315, 82.1643),
        'Bhatapara': (21.7371, 81.9388),
        'Tilda': (21.5540, 81.7760),
        'Mandhar': (21.3653, 81.6703),
        'Raipur Jn': (21.2565, 81.6293),
        'Bhilai Complex': (21.2050, 81.3900),
        'Durg Jn': (21.1968, 81.2846),
        'Marauda': (21.1444, 81.2905),
        'Balod': (20.7303, 81.2001),
        'Dallirajhara': (20.5841, 81.0470),
        'Rowghat': (19.897, 81.121),
        'Raipur Block Hut': (21.265, 81.635),
        'Mandir Hasaud': (21.2312, 81.7651),
        'Naya Raipur': (21.168, 81.782),
        'Lakholi': (21.2385, 81.8211),
        'Abhanpur Jn': (21.0505, 81.7505),
        'Rajim': (20.9654, 81.8751),
        'Dhamtari': (20.7153, 81.5501)
    }
    
    station_nodes = {}
    for name, (lat, lon) in target_stations.items():
        nid = find_closest_node(lat, lon, nodes)
        if nid:
            station_nodes[name] = nid
            print(f"Mapped {name} to node {nid} ({nodes[nid]})")
        else:
            print(f"Failed to map {name}")

    def trace_path(stops):
        full_path = []
        for i in range(len(stops) - 1):
            s1, s2 = stops[i], stops[i+1]
            n1, n2 = station_nodes.get(s1), station_nodes.get(s2)
            if not n1 or not n2:
                print(f"Missing nodes for {s1} or {s2}")
                continue
            path = dijkstra(graph, n1, n2, nodes)
            if path:
                if full_path:
                    full_path.extend(path[1:])
                else:
                    full_path.extend(path)
            else:
                print(f"NO PATH from {s1} to {s2}")
        # Convert to coords
        return [[nodes[n][0], nodes[n][1]] for n in full_path]

    print("Tracing TRACK_PATH...")
    track_path = trace_path(['Dadhapara', 'Bhatapara', 'Tilda', 'Raipur Jn', 'Bhilai Complex', 'Durg Jn'])
    
    print("Tracing MINERAL_CORRIDOR_PATH...")
    mineral_path = trace_path(['Durg Jn', 'Marauda', 'Balod', 'Dallirajhara', 'Rowghat'])
    
    print("Tracing BYPASS_PATH...")
    bypass_path = trace_path(['Raipur Block Hut', 'Mandir Hasaud', 'Naya Raipur', 'Lakholi'])
    
    print("Tracing SOUTHERN_LOOPS_PATH (Abhanpur -> Rajim)...")
    loop_rajim = trace_path(['Abhanpur Jn', 'Rajim'])
    print("Tracing SOUTHERN_LOOPS_PATH (Abhanpur -> Dhamtari)...")
    loop_dhamtari = trace_path(['Abhanpur Jn', 'Dhamtari'])
    southern_loops = loop_rajim + loop_dhamtari # simple concat for rendering
    
    print("Extracting BHILAI_YARD_PATHS...")
    yard_paths = []
    # Bbox around Bhilai: 21.19 - 21.23 lat, 81.30 - 81.42 lon
    for nd_refs, tags in valid_ways:
        if tags.get('railway') in ['yard', 'siding']:
            # check if inside bounding box
            if any(n in nodes for n in nd_refs):
                first_node = next(n for n in nd_refs if n in nodes)
                lat, lon = nodes[first_node]
                if 21.19 <= lat <= 21.23 and 81.30 <= lon <= 81.42:
                    coords = [[nodes[n][0], nodes[n][1]] for n in nd_refs if n in nodes]
                    yard_paths.append(coords)
                    
    # Generate stations data
    st_data = []
    chainage_base = 828.687 # Arbitrary starting chainage for Dadhapara to match example
    # We will just roughly assign chainage based on distance from Dadhapara
    ref_node = station_nodes.get('Dadhapara')
    for name, nid in station_nodes.items():
        if not nid: continue
        lat, lon = nodes[nid]
        dist = 0
        if ref_node:
            dist = haversine(nodes[ref_node][0], nodes[ref_node][1], lat, lon)
        
        is_jn = 'Jn' in name or 'Complex' in name
        pf = 7 if name == 'Raipur Jn' else (5 if name == 'Durg Jn' else 2)
        st_data.append({
            "id": name[:3].upper(),
            "name": name,
            "coordinates": [lat, lon],
            "chainage": round(chainage_base + dist, 3),
            "isJunction": is_jn,
            "platforms": pf
        })
        
    output = {
        "TRACK_PATH": track_path,
        "MINERAL_CORRIDOR_PATH": mineral_path,
        "BYPASS_PATH": bypass_path,
        "SOUTHERN_LOOPS_PATH": southern_loops,
        "BHILAI_YARD_PATHS": yard_paths,
        "STATIONS_DATA": st_data
    }
    
    with open('corridor_processed.json', 'w') as f:
        json.dump(output, f)
    print("Finished generating corridor_processed.json")

if __name__ == '__main__':
    main()

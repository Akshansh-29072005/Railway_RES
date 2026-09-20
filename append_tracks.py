import json

with open('all_tracks_processed.json') as f:
    data = json.load(f)

# we will write these to a new file and import them in MapComponent to avoid bloating corridorData.js too much
# or we can just append them. Let's create a new file for all tracks to keep things clean.
with open('frontend/src/data/allTracksData.js', 'w') as f:
    f.write("export const ALL_MAIN_TRACKS = [\n")
    for track in data['MAIN_TRACKS']:
        f.write("  [\n")
        for p in track:
            f.write(f"    [{p[0]:.5f}, {p[1]:.5f}],\n")
        f.write("  ],\n")
    f.write("];\n\n")
    
    f.write("export const ALL_YARD_TRACKS = [\n")
    for track in data['YARD_TRACKS']:
        f.write("  [\n")
        for p in track:
            f.write(f"    [{p[0]:.5f}, {p[1]:.5f}],\n")
        f.write("  ],\n")
    f.write("];\n")

print("Created allTracksData.js")

import fs from 'fs';
let content = fs.readFileSync('frontend/src/components/MapComponent.jsx', 'utf-8');
content = content.replace("updateTrainMarkers(map, state);", "console.log('Update trains:', state.trains.length);\n      updateTrainMarkers(map, state);");
content = content.replace("updateSignalMarkers(map, state);", "console.log('Update signals:', state.signals.length);\n      updateSignalMarkers(map, state);");
fs.writeFileSync('frontend/src/components/MapComponent.jsx', content);

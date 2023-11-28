// import React, { useEffect } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import 'leaflet.markercluster/dist/MarkerCluster.css';
// import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// import './leaflet-heat.js';


// const HeatMap = () => {
//   useEffect(() => {
//     const map = L.map('map').setView([-37.87, 175.475], 11);

//     // OSM layer
//     const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     });
//     osm.addTo(map);

//     // Example data - Replace this with your actual data
//     // const addressPoints = [
//     //   [-37.85, 175.5],
//     //   [-37.86, 175.48],
//     //   [-37.88, 175.46],
//     //   // Add more data points as needed
//     // ];
//     const addressPoints = [
//       [-37.8839, 175.3745188667, 571],
//       [-37.8869090667, 175.3657417333, 486],
//       [-37.8894207167, 175.4015351167, 807],
//       [-37.8927369333, 175.4087452333, 899],
//       [-37.90585105, 175.4453463833, 1273],
//       [-37.9064188833, 175.4441556833, 1258],
//       [-37.90584715, 175.4463564333, 1279],
//       [-37.9033391333, 175.4244005667, 1078],
//       [-37.9061991333, 175.4492620333, 1309],
//       [-37.9058955167, 175.4445613167, 1261],
//       [-37.88888045, 175.39146475, 734],
//       [-37.8950811333, 175.41079175, 928],
//       [-37.88909235, 175.3922956333, 740],
//       [-37.8889259667, 175.3938591667, 759],
//       [-37.8876576333, 175.3859563833, 687],
//       [-37.89027155, 175.3973178833, 778],
//     ]

//     const formattedAddressPoints = addressPoints.map((p) => [p[0], p[1],p[2]]);

//     const heat = L.heatLayer(formattedAddressPoints).addTo(map);

//     // Dynamically create and append script tag
//     const script = document.createElement('script');
//     script.src = 'http://leaflet.github.io/Leaflet.markercluster/example/realworld.10000.js';
//     script.async = true;
//     document.head.appendChild(script);

//     return () => {
//       map.remove(); // Clean up Leaflet instance on component unmount
//       document.head.removeChild(script); // Remove appended script on unmount
//     };
//   }, []); // Empty dependency array ensures useEffect runs only once on mount

//   return <div id="map" style={{ height: '85vh', width: '100%' }}></div>;
// };

// export default HeatMap;

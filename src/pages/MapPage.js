import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';

// Create custom icon
const customIconStyle = {
  // iconUrl: require('./logo.svg'),
  iconUrl: './logo.svg',
  iconSize: [38, 38], // size of the icon
};
const customIcon = L.icon(customIconStyle);
const styles = {
  '*': {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  },
  '#root': {
    height: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1em',
    fontFamily: 'sans-serif',
    color: '#333',
    top:'10',
    backgroundColor: '#f3e4d7',
  },
  '.leaflet-container': {
    // height: '90vh',
    flex:1,
    width: '100%',
    // borderRadius: '2rem',
    // alignItems:'centre',
    // position: 'absolute',
    // right: '10',
    // bottom: '10',
  },
};

const markers = [
  {
    geocode: [48.86, 2.3522],
    popUp: 'Hello, I am pop up 1',
  },
  {
    geocode: [48.85, 2.3522],
    popUp: 'Hello, I am pop up 2',
  },
  {
    geocode: [48.855, 2.34],
    popUp: 'Hello, I am pop up 3',
  },
];
const createClusterCustomIcon =(cluster) =>{
  return L.divIcon({
    html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
    className: 'custom-marker-cluster',
    iconSize: [33, 33],
    iconAnchor: [16, 32], // Adjust the anchor point if needed
    backgroundColor: '#333',
    height: '2em',
    width: '2em',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    fontSize: '1.2rem',
    boxShadow: '0 0 0px 5px #fff',
  });
};

export default function App() {
  return (
    <div style={styles['*']}>
      <div id="root" style={styles['#root']}>
        <MapContainer center={[22.572645, 88.363892]} zoom={15} style={styles['.leaflet-container']}>
          {/* OPEN STREEN MAPS TILES */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* <TileLayer
          attribution="Google Maps"
          // url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" // regular
          url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" // satellite
          // url="http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}" // terrain
          maxZoom={20}
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          /> */}
          <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
            {markers.map((marker, index) => (
              <Marker key={index} position={marker.geocode} icon={customIcon}>
                <Popup>{marker.popUp}</Popup>
              </Marker>
            ))}
            <Marker position={[22.505, 88.09]} icon={customIcon}>
              <Popup>This is popup 1</Popup>
            </Marker>
            <Marker position={[22.504, 88.1]} icon={customIcon}>
              <Popup>This is popup 2</Popup>
            </Marker>
            <Marker position={[22.5, 88.09]} icon={customIcon}>
              <Popup>This is popup 3</Popup>
            </Marker>
        </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import axios from 'axios';

const activeIconStyle = {
  iconUrl: '/assets/icons/green.svg',
  iconSize: [38, 38],
};

const inactiveIconStyle = {
  iconUrl: '/assets/icons/red.svg',
  iconSize: [38, 38],
};

const customIcon = L.icon(activeIconStyle);

const styles = {
  // Your styles here
  '*': {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  },
  '#root': {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    // gap: '1em',
    
    fontFamily: 'sans-serif',
    fontSize : '100 rem',
    color: '#000000',
    backgroundColor: '#f3e4d7',
  },
  '.leaflet-container': {
    height: '100%',
    width: '100%',
    borderRadius: '2rem',
  },
  '.marker-cluster': {
    width: "30px",
    height: "30px",
    fontSize : "15px"
    // text-align: "center",
    // border-radius: 15px;
    // font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
    },
};

export default function App() {
  const [markersData, setMarkersData] = useState([]);

  useEffect(() => {
    // Define the URL of your backend API
    const apiUrl = 'http://127.0.0.1:8000/list/sensors';

    // Use Axios to make a GET request to the API
    axios.get(apiUrl)
      .then((response) => {
        // Assuming the response data is an array of markers
        const formattedMarkers = response.data
          .filter(data => data.lat !== 0 && data.long !== 0) // Filter out data with lat or long equal to 0
          .map((data, index) => ({
            geocode: [data.lat, data.long],
            popUp: data.is_active ? 'Active' : 'Inactive',
            icon: data.is_active ? L.icon(activeIconStyle) : L.icon(inactiveIconStyle),

          }));

        // Set the formatted markers in the state
        setMarkersData(formattedMarkers);

        // Set the formatted markers in the state
        console.log("retrieved data");
        console.log(formattedMarkers);
        setMarkersData(formattedMarkers);
      })
      .catch((error) => {
        console.error('Error fetching markers:', error);
      });
  }, []);

  const createClusterCustomIcon = function (cluster) {
    return L.divIcon({
      html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
      className: 'custom-marker-cluster',
      iconSize: [33, 33],
      iconAnchor: [16, 32],
      backgroundColor: '#333',
      height: '100%',
      width: '100%',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // borderRadius: '50%',
      // fontSize: '50 rem',
      boxShadow: '0 0 0px 5px #fff',
    });
  };

  return (
    <div style={styles['*']}>
      <div id="root" style={styles['#root']}>
        <MapContainer center={[22.572, 88.364]} zoom={10} style={styles['.leaflet-container']}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
            {markersData.map((marker, index) => (
              <Marker key={index} position={marker.geocode} icon={marker.icon}>
                <Popup>{marker.popUp}</Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}
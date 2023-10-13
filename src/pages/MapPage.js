import React, { useState, useEffect,useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import axios from 'axios';
import SimplCard from '../components/card/SimpleCard.js';
// import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import { Divider } from '@mui/material';

const activeIconStyle = {
  iconUrl: '/assets/icons/green.svg',
  iconSize: [50, 50],
};

const inactiveIconStyle = {
  iconUrl: '/assets/icons/red.svg',
  iconSize: [50, 50],
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
    height: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1em',
    fontFamily: 'sans-serif',
    color: '#333',
    top: '10',
    backgroundColor: '#f3e4d7',
  },
  '.leaflet-container': {
    flex: 1,
    width: '100%',
  },
  '.marker-cluster': {
    width: '30px',
    height: '30px',
    fontSize: '15px',
  },
};

export default function App() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  // const [selectedMacid, setSelectedMacid] = useState(null);
  const myComponentRef=useRef(null);  
  const scrollToComponent = () => {
    if (myComponentRef.current) {
      myComponentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const handleIconClick = (macid, index) => {
    // setSelectedMacid(macid);
    setSelectedImageIndex(macid);
    scrollToComponent();
  };
  const [markersData, setMarkersData] = useState([]);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  useEffect(() => {
    // Define the URL of your backend API
    const apiUrl = 'http://127.0.0.1:8000/list/sensors_nonstatic/';

    // Use Axios to make a GET request to the API
    axios
      .get(apiUrl)
      .then((response) => {
        // Assuming the response data is an array of markers
        const formattedMarkers = response.data
          .filter((data) => data.lat !== 0 && data.long !== 0) // Filter out data with lat or long equal to 0
          .map((data, index) => ({
            geocode: [data.lat, data.long],
            macid:data.macid,
            // popUp: data.is_active ? 'active' : 'Inactive',
            popUp: `MAC ID: ${data.macid}\n Avg 2.5: ${data.avg2_5.toFixed(2)}\nAvg 10.0: ${data.avg10_0.toFixed(2)}`,
            icon: data.is_active ? L.icon(activeIconStyle) : L.icon(inactiveIconStyle),
          }));

        // Set the formatted markers in the state
        console.log('retrieved data');
        console.log(formattedMarkers);
        setMarkersData(formattedMarkers);
      })
      .catch((error) => {
        console.error('Error fetching markers:', error);
      });

    // Set up an interval to refresh the page every 15 seconds
    const refreshInterval = setInterval(() => {
      console.log({lastRefreshTime});
      setLastRefreshTime(new Date());
      window.location.reload(); // Reload the page
    }, 900000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(refreshInterval);
  }, []);

  const createClusterCustomIcon = function (cluster) {
    return L.divIcon({
      html: `
        <div class="cluster-icon">
          <img src="/assets/icons/clusterIcon.svg" />
          <div class="cluster-count" style="font-size: 22px; color: black;">${cluster.getChildCount()}</div>
          </div>
      `,
      className: 'custom-marker-cluster',
      iconSize: [4, 4], // Adjust the icon size here

      // iconAnchor: [20, 20], // Adjust the anchor point for proper positioning
      backgroundColor: '#333',
      color: '#fff',
      boxShadow: '0 0 0px 5px #fff',
    });
  };
  
  return (
    <div style={styles['*']}>
      <div id="root" style={styles['#root']}>
        <MapContainer center={[22.572, 88.364]} zoom={12} style={styles['.leaflet-container']}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
            {markersData.map((marker, index) => (
              <Marker key={index} position={marker.geocode} icon={marker.icon}>
                <Popup>
                  <div>
                    {marker.popUp}
                  </div>
                  <Divider></Divider>
                  {/* <Button variant="contained" onClick={()=>setSelectedImageIndex(index)}>Contained</Button> */}
                  <Fab variant="extended" size="medium" color="primary" onClick={()=>handleIconClick(marker.macid,index)}>
                    Show
                  </Fab>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      {selectedImageIndex !== null && (
        <div ref={myComponentRef}>
          <SimplCard></SimplCard>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import axios from 'axios';
import Papa from 'papaparse';
import SimplCard from '../components/card/SimpleCard';
import Fab from '@mui/material/Fab';
import { Divider } from '@mui/material';

// Import necessary styles for MarkerClusterGroup if you haven't already
const activeIconStyle = {
  iconUrl: '/assets/icons/green.svg',
  iconSize: [50, 50],
};
const inactiveIconStyle = {
  iconUrl: '/assets/icons/red.svg',
  iconSize: [50, 50],
};

const iconStyles = {
  '0-50': {
    iconUrl: '/assets/icons/0-50.svg',
    iconSize: [50, 50],
  },
  '50-100': {
    iconUrl: '/assets/icons/50-100.svg',
    iconSize: [50, 50],
  },
  '100-150': {
    iconUrl: '/assets/icons/100-150.svg',
    iconSize: [50, 50],
  },
  '150-200': {
    iconUrl: '/assets/icons/150-200.svg',
    iconSize: [50, 50],
  },
  '200-300': {
    iconUrl: '/assets/icons/200-300.svg',
    iconSize: [50, 50],
  },
  '300+': {
    iconUrl: '/assets/icons/300+.svg',
    iconSize: [50, 50],
  },
  inactive: {
    iconUrl: '/assets/icons/inactive.svg',
    iconSize: [50, 50],
  },
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
// Define your icon styles...


export default function App() {
  const [points, setPoints] = useState([]);
  const [csvFile, setCsvFile] = useState('/assets/routes/M03.csv');
  const [polylineColor, setPolylineColor] = useState('blue');
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [markersData, setMarkersData] = useState([]);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const myComponentRef = useRef(null);

  // Fetch CSV data for polyline
  useEffect(() => {
    const fetchCsvData = async () => {
      try {
        const response = await fetch(csvFile);
        const text = await response.text();
        const result = Papa.parse(text, { header: false });

        const parsedPoints = result.data
          .map(row => [parseFloat(row[0]), parseFloat(row[1])])
          .filter(coords => !isNaN(coords[0]) && !isNaN(coords[1]));

        setPoints(parsedPoints);
        setPolylineColor(csvFile === '/assets/routes/M03.csv' ? 'blue' : 'red');
      } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
      }
    };

    fetchCsvData();
  }, [csvFile]);

  // Fetch marker data from API
  useEffect(() => {
    // Define the URL of your backend API
    const apiUrl = 'http://127.0.0.1:8000/list/sensors_nonstatic/';

    // Use Axios to make a GET request to the API
    axios
      .get(apiUrl)
      .then((response) =>  {
        // Assuming the response data is an array of markers
        const formattedMarkers = response.data
          .filter((data) => data.lat !== 0 && data.long !== 0)
          .map((data, index) => {
            // Determine the icon style based on avg2_5 range
            let iconStyle;
            if (!data.is_active) {
              // If inactive
              iconStyle = iconStyles.inactive;
            } else {
              if (data.avg2_5 >= -1 && data.avg2_5 < 50) {
                iconStyle = iconStyles['0-50'];
              } else if (data.avg2_5 >= 50 && data.avg2_5 < 100) {
                iconStyle = iconStyles['50-100'];
              } else if (data.avg2_5 >= 100 && data.avg2_5 < 150) {
                iconStyle = iconStyles['100-150'];
              } else if (data.avg2_5 >= 150 && data.avg2_5 < 200) {
                iconStyle = iconStyles['150-200'];
              } else if (data.avg2_5 >= 200 && data.avg2_5 < 300) {
                iconStyle = iconStyles['200-300'];
              } else {
                iconStyle = iconStyles['300+'];
              }
            }

            return {
              geocode: [data.lat, data.long],
              macid:data.macid,
              popUp: `MAC ID: ${data.macid}\n Avg 2.5: ${data.avg2_5.toFixed(2)}\nAvg 10.0: ${data.avg10_0.toFixed(2)}`,
              icon: L.icon(iconStyle),
            };
          });

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

  // Handlers
  const handleToggleCsv = () => {
    setCsvFile(prevCsvFile => (prevCsvFile === '/assets/routes/M03.csv' ? '/assets/routes/M02.csv' : '/assets/routes/M03.csv'));
  };

  const handleIconClick = index => {
    setSelectedImageIndex(index);
    myComponentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={points} color={polylineColor} />
          <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
             {markersData.map((marker, index) => (
              <Marker key={index} position={marker.geocode} icon={marker.icon}>
                <Popup>
                  <div>
                    {marker.popUp}
                  </div>
                  <Divider></Divider>
                  {/* <Button variant="contained" onClick={()=>setSelectedImageIndex(index)}>Contained</Button> */}
                  <Fab variant="extended" size="medium" color="primary" onClick={()=>handleIconClick(marker.macid)}>
                    Show Details
                  </Fab>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>

        </MapContainer>
      </div>
      {selectedImageIndex !== null && (
        <div ref={myComponentRef}>
          <SimplCard style={{ marginTop: '20px' }}
          title='Sensor Plot'
          subheader="Last 7 days"
          macid={selectedImageIndex}
          />
        </div>
      )}
      <div>
        <Fab variant="extended" size="medium" color="primary" onClick={handleToggleCsv}>
          Toggle Route
        </Fab>
      </div>
    </div>
  );
}


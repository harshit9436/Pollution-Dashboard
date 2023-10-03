import { faker } from '@faker-js/faker';
import { sample } from 'lodash';
import L from 'leaflet';
import axios from 'axios';

// ----------------------------------------------------------------------

// const [sensorData, setSensorData] = useState([]);
// useEffect(() => {
//   const apiUrl = 'http://127.0.0.1:8000/list/sensors';
//   axios
//     .get(apiUrl)
//     .then((response) => {
//       const formattedMarkers = response.data
//         .filter((data) => data.lat !== 0 && data.long !== 0)
//         .map((data, index) => ({
//           geocode: [data.lat, data.long],
//           popUp: data.is_active ? 'Active' : 'Inactive',
//           icon: data.is_active ? L.icon(activeIconStyle) : L.icon(inactiveIconStyle),
//         }));
//       console.log('retrieved data');
//       console.log(formattedMarkers);
//       setMarkersData(formattedMarkers);
//     })
//     .catch((error) => {
//       console.error('Error fetching markers:', error);
//     });

//   // Set up an interval to refresh the page every 15 seconds
//   const refreshInterval = setInterval(() => {
//     console.log({lastRefreshTime});
//     setLastRefreshTime(new Date());
//     window.location.reload(); // Reload the page
//   }, 900000);

//   // Clean up the interval when the component unmounts
//   return () => clearInterval(refreshInterval);
// }, []);


const users = [...Array(24)].map((_, index) => ({
  id: faker.datatype.uuid(),
  avatarUrl: `/assets/images/avatars/avatar_${index + 1}.jpg`,
  name: faker.name.fullName(),
  company: faker.company.name(),
  isVerified: faker.datatype.boolean(),
  status: sample(['active', 'banned']),
  role: sample([
    'Leader',
    'Hr Manager',
    'UI Designer',
    'UX Designer',
    'UI/UX Designer',
    'Project Manager',
    'Backend Developer',
    'Full Stack Designer',
    'Front End Developer',
    'Full Stack Developer',
  ]),
}));

export default users;

// import { useState, useEffect } from 'react';
// import L from 'leaflet';
// import axios from 'axios';

// function YourComponent() {
//   const [sensorData, setSensorData] = useState([]);
//   const [lastRefreshTime, setLastRefreshTime] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const apiUrl = 'http://127.0.0.1:8000/list/sensors';
//         const response = await axios.get(apiUrl);

//         const formattedMarkers = response.data
//           .filter((data) => data.lat !== 0 && data.long !== 0)
//           .map((data, index) => ({
//             geocode: [data.lat, data.long],
//             popUp: data.is_active ? 'Active' : 'Inactive',
//             icon: data.is_active ? L.icon(activeIconStyle) : L.icon(inactiveIconStyle),
//           }));

//         console.log('Retrieved data:');
//         console.log(formattedMarkers);
//         setSensorData(formattedMarkers);
//       } catch (error) {
//         console.error('Error fetching markers:', error);
//       }
//     };

//     fetchData(); // Call the fetchData function when the component mounts

//     // Set up an interval to refresh the page every 15 seconds
//     const refreshInterval = setInterval(() => {
//       console.log({ lastRefreshTime });
//       setLastRefreshTime(new Date());
//       window.location.reload(); // Reload the page
//     }, 900000);

//     // Clean up the interval when the component unmounts
//     return () => clearInterval(refreshInterval);
//   }, []);

//   // Rest of your component code...

//   return (
//     // JSX for your component...
//   );
// }

// export default YourComponent;

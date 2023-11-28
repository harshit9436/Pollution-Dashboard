import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import L from 'leaflet';
import Papa from 'papaparse';

const CsvPointsMap = () => {
  const [points, setPoints] = useState([]);
  const [csvFile, setCsvFile] = useState('M03.csv');
  const [polylineColor, setPolylineColor] = useState('blue');

  const fetchCsvData = async () => {
    try {
      const response = await fetch(csvFile);
      const text = await response.text();
      const result = Papa.parse(text, { header: false });

      const parsedPoints = result.data
        .map(row => [parseFloat(row[0]), parseFloat(row[1])])
        .filter(coords => !isNaN(coords[0]) && !isNaN(coords[1]));

      setPoints(parsedPoints);

      // Set polyline color based on CSV file
      setPolylineColor(csvFile === 'M03.csv' ? 'blue' : 'red');
    } catch (error) {
      console.error('Error fetching or parsing CSV:', error);
    }
  };

  useEffect(() => {
    fetchCsvData();
  }, [csvFile]);

  useEffect(() => {
    if (points.length > 0) {
      const map = L.map('map').setView(points[0], 15);

      L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(map);

      const validPoints = points.filter(coords => !isNaN(coords[0]) && !isNaN(coords[1]));
      const polyline = L.polyline(validPoints, { color: polylineColor }).addTo(map);

      map.fitBounds(polyline.getBounds());

      return () => {
        map.remove();
      };
    }
  }, [points, polylineColor]);

  const handleToggleCsv = () => {
    // Toggle between M03.csv and M02.csv
    setCsvFile((prevCsvFile) => (prevCsvFile === 'M03.csv' ? 'M02.csv' : 'M03.csv'));
  };

  return (
    <div style={{ width: '100%' }}>
      <div id="map" style={{ height: '90vh', width: '100%', borderRadius: '2rem' }}></div>
      <button onClick={handleToggleCsv}>Toggle CSV</button>
    </div>
  );
};

export default CsvPointsMap;

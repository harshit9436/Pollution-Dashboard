import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardHeader, Box } from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';
import { useChart } from '../../components/chart'; 


SimpleCard.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  macid: PropTypes.string.isRequired,
};

export default function SimpleCard({ title, subheader, macid, ...other }) {
  const [pm2_5Data, setPm2_5Data] = useState([]); 
  const [pm10_0Data, setPm10_0Data] = useState([]);
  const [ts, set_ts] = useState([]);
  
  const encodedMacId = encodeURIComponent(macid);
  const fetchSensorData = async () => {
    try {
      const apiUrl = `http://127.0.0.1:8000/sensors/${encodedMacId}/?offset=7`;
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchSensorData().then(data => {
      if (data) {
        const pm2_5Data = data.map(point => parseFloat(point.pm2_5));
        const pm10_0Data = data.map(point => parseFloat(point.pm10_0));
        const formattedTimestamps = data.map(point => {
          const unixTimestamp = parseInt(point.ts) * 1000;
          const formattedDate = format(new Date(unixTimestamp), 'MM/dd/yyyy HH:mm:ss');
          return formattedDate;
        });

        setPm2_5Data(pm2_5Data);
        setPm10_0Data(pm10_0Data);
        set_ts(formattedTimestamps);
      }
    });
  }, [macid]);

  const chartLabels = ts;
  const chartData = [
    {
      name: 'PM 2.5',
      type: 'line',
      fill: 'solid',
      data: pm2_5Data,
    },
    {
      name: 'PM 10',
      type: 'line',
      fill: 'solid',
      data: pm10_0Data,
    },
  ];

  const chartOptions = useChart({
    plotOptions: { bar: { columnWidth: '16%' } },
    fill: { type: chartData.map((i) => i.fill) },
    labels: chartLabels,
    xaxis: { type: 'datetime' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return `${y.toFixed(0)} visits`;
          }
          return y;
        },
      },
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <ReactApexChart type="line" series={chartData} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}

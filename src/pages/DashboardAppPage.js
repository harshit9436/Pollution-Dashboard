import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @muiimport { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Container, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { format } from 'date-fns';

import Iconify from '../components/iconify';
import {
  AppWebsiteVisits,
  AppWidgetSummary,
  AppSensorMaps,
} from '../sections/@dashboard/app';

export default function DashboardAppPage() {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [wdata, setwData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wloading, setwLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [pm2_5Data, setPm2_5Data] = useState([]); // Add pm2_5Data state
  const [pm10_0Data, setPm10_0Data] = useState([]);
  const [ts, set_ts] = useState([]);

  const fetchData = () => {
    axios.get('http://127.0.0.1:8000/average_daily/')
      .then(response => {
        setData(response.data);
        console.log('Today\'s data from API:', response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching today\'s data:', error);
        setLoading(false);
      });
  };

  const fetchwData = () => {
    axios.get('http://127.0.0.1:8000/average_weekly/')
      .then(response => {
        setwData(response.data);
        console.log('Weekly data from API:', response.data);
        setwLoading(false);
      })
      .catch(error => {
        console.error('Error fetching weekly data:', error);
        setwLoading(false);
      });
  };

  const fetchSensorData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchData();
    fetchwData();
    fetchSensorData().then(data => {
      if (data) {
        const pm2_5Data = data.map(point => parseFloat(point.pm2_5));
        const pm10_0Data = data.map(point => parseFloat(point.pm10_0));
        const formattedTimestamps = data.map(point => {
          const unixTimestamp = parseInt(point.ts) * 1000; // Convert to milliseconds
          const formattedDate = format(new Date(unixTimestamp), 'MM/dd/yyyy HH:mm:ss');
          return formattedDate;
        });
        // const formattedTimestamps = data.map(point => {
        // const dateStrings = data.map(point => String(point.ts)); // Assuming ts is in the format "DD/MM/YYYY"
        // const formattedDate = format(new Date(dateString), 'dd/MM/yyyy');

        // const dates = dateStrings.map(dateString => {
        // const [day, month, year] = dateString.split('/').map(Number);
        //   return new Date(year, month - 1, day);
        // });        //   const formattedDate = format(new Date(unixTimestamp), 'MM/dd/yyyy HH:mm:ss');
        //   return formattedDate;
        // });

        setPm2_5Data(pm2_5Data); // Set pm2_5Data state
        setPm10_0Data(pm10_0Data); // Set pm2_5Data state
        set_ts(formattedTimestamps);
        const chartData = [
          { data: pm2_5Data, label: 'PM2.5', yAxisKey: 'leftAxisId' },
          { data: pm10_0Data, label: 'PM10.0', yAxisKey: 'rightAxisId' },
        ];
        console.log(pm2_5Data);
        console.log(formattedTimestamps);
        // const chartData = [
        //   { data: pm2_5Data, label: 'PM2.5', yAxisKey: 'leftAxisId' },
        //   { data: pm10_0Data, label: 'PM10.0', yAxisKey: 'rightAxisId' },
        // ];

        setChartData({ xLabels: formattedTimestamps, chartData });
        setChartLoading(false);
      }
    });
  }, []);



  return (
    <>
      <Helmet>
        <title>Kolkata Pollution Board</title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Today's PM2.5"
              total={data.pm2_5_avg}
              icon={'ant-design:android-filled'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Today's PM10"
              total={data.pm10_0_avg}
              color="info"
              icon={'ant-design:apple-filled'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Weekly PM2.5"
              total={wdata.pm2_5_avg}
              color="warning"
              icon={'ant-design:windows-filled'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Weekly PM10"
              total={wdata.pm10_0_avg}
              color="error"
              icon={'ant-design:bug-filled'}
            />
          </Grid>



        <Grid item xs={12} md={6} lg={8}>
            <AppWebsiteVisits
              title="Average Sensor Data"
              subheader=""
              chartLabels={ts} // Convert and format dates

              chartData={[
                {
                  name: 'PM2_5',
                  type: 'line',
                  fill: 'solid',
                  data: pm2_5Data,
                },
                {
                  name: 'PM10_0',
                  type: 'line',
                  fill: 'solid',
                  data: pm10_0Data,
                },
                // {
                //   name: 'Team C',
                //   type: 'line',
                //   fill: 'solid',
                //   data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                // },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppSensorMaps
              title="Sensor Maps"
              list={[
                {
                  id: 1,
                  title: 'NonStatic Sensors',
                  description:
                    'Position of the Active/Inactive Sensors',
                  image: `/assets/images/covers/cover_2.jpg`,
                  postedAt: faker.date.recent(),
                  path: '/dashboard/maps',
                },
                {
                  id: 2,
                  title: 'Static Sensors',
                  description:
                    'Tracks of mobi sensors crisscrossing the city in last one hour',
                  image: `/assets/images/covers/cover_3.jpg`,
                  postedAt: faker.date.recent(),
                  path: '/dashboard/mapstatic',
                },
                {
                  id: 3,
                  title: 'Hourly PM 2.5',
                  description:
                    'Last hour average PM 2.5 sensorwise on map',
                  image: `/assets/images/covers/cover_4.jpg`,
                  postedAt: faker.date.recent(),
                  path: '/dashboard/maps',
                },
                {
                  id: 4,
                  title: 'PM2.5 Interpolation',
                  description:
                    ' Interpolation of last hour average PM 2.5 over the entire deployment area',
                  image: `/assets/images/covers/cover_5.jpg`,
                  postedAt: faker.date.recent(),
                  path: '/dashboard/maps',
                },
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

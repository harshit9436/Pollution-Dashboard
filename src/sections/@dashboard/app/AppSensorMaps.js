// @mui
import PropTypes from 'prop-types';
import { Box, Stack, Card,Link, Typography, CardHeader } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
// utils
import { fToNow } from '../../../utils/formatTime';
// components
import Scrollbar from '../../../components/scrollbar';

AppSensorMaps.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
};

export default function AppSensorMaps({ title, subheader, list, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
          {list.map((geomap) => (
            <MapItem key={geomap.id} geomaps={geomap} />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

MapItem.propTypes = {
  geomaps: PropTypes.shape({
    description: PropTypes.string,
    image: PropTypes.string,
    postedAt: PropTypes.instanceOf(Date),
    title: PropTypes.string,
    path: PropTypes.string,
  }),
};

function MapItem({ geomaps }) {
  const { image, title, description, postedAt,path} = geomaps;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box component="img" alt={title} src={image} sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0 }} />

      <Box sx={{ minWidth: 240, flexGrow: 1 }}>
        <Link to={path} component={RouterLink}  color="inherit" variant="subtitle2" underline="hover" noWrap>
          {title}
        </Link>
        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {description}
        </Typography>
      </Box>

      <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
        {fToNow(postedAt)}
      </Typography>
    </Stack>
  );
}

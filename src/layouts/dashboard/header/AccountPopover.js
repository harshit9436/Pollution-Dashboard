// import { useState } from 'react';
// import { alpha } from '@mui/material/styles';
// import { Box, Divider, Typography, Stack, MenuItem, Avatar, IconButton, Popover } from '@mui/material';
// import account from '../../../_mock/account';

// const MENU_OPTIONS = [
//   {
//     label: 'Add Admin',
//     icon: 'eva:home-fill',
//   },
//   // {
//   //   label: 'Profile',
//   //   icon: 'eva:person-fill',
//   // },
//   // {
//   //   label: 'Settings',
//   //   icon: 'eva:settings-2-fill',
//   // },
// ];

// export default function AccountPopover() {
//   const [open, setOpen] = useState(null);

//   const handleOpen = (event) => {
//     setOpen(event.currentTarget);
//   };

//   const handleLogout = () => {
//     // Clear the JWT token from local storage
//     localStorage.removeItem('jwtToken');

//     // Close the popover
//     setOpen(null);

//     // Show a "Logout successful" message
//     alert('Logout successful');

//     // Navigate to the dashboard
//     // Replace '/dashboard' with the actual dashboard URL
//     window.location.href = '/dashboard';
//   };

//   const handleClose = () => {
//     setOpen(null);
//   };

//   return (
//     <>
//       <IconButton
//         onClick={handleOpen}
//         sx={{
//           p: 0,
//           ...(open && {
//             '&:before': {
//               zIndex: 1,
//               content: "''",
//               width: '100%',
//               height: '100%',
//               borderRadius: '50%',
//               position: 'absolute',
//               bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
//             },
//           }),
//         }}
//       >
//         <Avatar src={account.photoURL} alt="photoURL" />
//       </IconButton>

//       <Popover
//         open={Boolean(open)}
//         anchorEl={open}
//         onClose={handleClose}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//         transformOrigin={{ vertical: 'top', horizontal: 'right' }}
//         PaperProps={{
//           sx: {
//             p: 0,
//             mt: 1.5,
//             ml: 0.75,
//             width: 180,
//             '& .MuiMenuItem-root': {
//               typography: 'body2',
//               borderRadius: 0.75,
//             },
//           },
//         }}
//       >
//         <Box sx={{ my: 1.5, px: 2.5 }}>
//           <Typography variant="subtitle2" noWrap>
//             {account.displayName}
//           </Typography>
//           <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
//             {account.email}
//           </Typography>
//         </Box>

//         <Divider sx={{ borderStyle: 'dashed' }} />

//         <Stack sx={{ p: 1 }}>
//           {MENU_OPTIONS.map((option) => (
//             <MenuItem key={option.label} onClick={handleClose}>
//               {option.label}
//             </MenuItem>
//           ))}
//         </Stack>

//         <Divider sx={{ borderStyle: 'dashed' }} />

//         <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
//           Logout
//         </MenuItem>
//       </Popover>
//     </>
//   );
// }


import { useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem, Avatar, IconButton, Popover } from '@mui/material';
import account from '../../../_mock/account';
import { Link as RouterLink,useNavigate } from 'react-router-dom';
const MENU_OPTIONS = [
  {
    label: 'Add Admin',
    
    icon: 'eva:home-fill',
  },
  // {
  //   label: 'Profile',
  //   icon: 'eva:person-fill',
  // },
  // {
  //   label: 'Settings',
  //   icon: 'eva:settings-2-fill',
  // },
];

export default function AccountPopover() {
  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the JWT token from local storage
    localStorage.removeItem('jwtToken');

    // Close the popover
    setOpen(null);

    // Show a "Logout successful" message
    alert('Logout successful');

    // Navigate to the dashboard
    // Replace '/dashboard' with the actual dashboard URL
    window.location.href = '/dashboard';
  };

  const handleAddAdmin = () => {
    // Fetch the JWT token from local storage
    const jwtToken = localStorage.getItem('jwtToken');

    // Check if JWT token is empty or null
    if (!jwtToken) {
      // Show a "Login required" message
      alert('Login required');
    } else {
      // Navigate to the "Add Admin" page
      navigate('/admin');
    }
    
    // Close the popover
    setOpen(null);
  };

  const handleClose = () => {
    setOpen(null);
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <Avatar src={account.photoURL} alt="photoURL" />
      </IconButton>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1.5,
            ml: 0.75,
            width: 180,
            '& .MuiMenuItem-root': {
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {account.displayName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {account.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={option.label === 'Add Admin' ? handleAddAdmin : handleClose}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}


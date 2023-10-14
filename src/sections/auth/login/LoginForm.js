// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// // @mui
// import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
// import { LoadingButton } from '@mui/lab';
// // components
// import Iconify from '../../../components/iconify';

// // ----------------------------------------------------------------------

// export default function LoginForm() {
//   const navigate = useNavigate();

//   const [showPassword, setShowPassword] = useState(false);

//   const handleClick = () => {
//     navigate('/dashboard', { replace: true });
//   };

//   return (
//     <>
//       <Stack spacing={3}>
//         <TextField name="email" label="Email address" />

//         <TextField
//           name="password"
//           label="Password"
//           type={showPassword ? 'text' : 'password'}
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
//                   <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//         />
//       </Stack>

//       <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
//         <Checkbox name="remember" label="Remember me" />
//         <Link variant="subtitle2" underline="hover">
//           Forgot password?
//         </Link>
//       </Stack>

//       <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
//         Login
//       </LoadingButton>
//     </>
//   );
// }



import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    try {
      // Send a request to your backend to obtain the JWT token
      const response = await fetch('http://127.0.0.1:8000/test/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const jwtToken = data.token; // Assuming your response contains a 'token' field
        console.log(data.token);

        // Store the JWT token in local storage or any other client-side storage mechanism
        localStorage.setItem('jwtToken', jwtToken);

        // Navigate to the dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Handle login error, e.g., display an error message
        console.error('Login failed');
      }
    } catch (error) {
      console.error('An error occurred while logging in', error);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField
          name="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Checkbox
          name="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          label="Remember me"
        />
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton fullWidth size="large" variant="contained" onClick={handleLogin}>
        Login
      </LoadingButton>
    </>
  );
}

 
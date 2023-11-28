import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Iconify from '../../../components/iconify';

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [result, setResult] = useState('');

  const handleLogin = async () => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      // Send a request to your backend to obtain the JWT token
      const response = await fetch('http://10.17.5.49:8000/token/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const jwtToken = data.access_token;
        console.log(data.access_token);

        // Store the JWT token in local storage or any other client-side storage mechanism
        localStorage.setItem('jwtToken', jwtToken);

        const url = 'http://10.17.5.49:8000/test_token/';  // Replace with your actual backend URL

        fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'), // Add your JWT token here
          },
        })
          .then(response2 => {
            if (response2.ok) {
              return response2.json();
            } else {
              throw new Error('Failed to fetch data');
            }
          })
          .then(data2 => {
            console.log(data2);
            // Handle the response data here
          })
          .catch(error => {
            console.error('Error:', error);
          });

        // Navigate to the dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Handle login error
        setResult('Wrong username or password');
      }
    } catch (error) {
      console.error('An error occurred while logging in', error);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField
          name="username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        />
        <RouterLink to="/dashboard">
          Go to dashboard
        </RouterLink>
      </Stack>

      {result && <p>{result}</p>}

      <LoadingButton fullWidth size="large" variant="contained" onClick={handleLogin}>
        Login
      </LoadingButton>
    </>
  );
}


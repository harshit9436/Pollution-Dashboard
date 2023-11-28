import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Iconify from '../../../components/iconify';
import axios from 'axios';

export default function AdminForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');

  const handleAdmin = async () => {
    const jwtToken = getToken();

    if (!jwtToken) {
      setResult('Login required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);

      const response = await axios.post('http://10.17.5.49:8000/add_admin/', formData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.status === 200) {
        setResult('Admin successfully added');
        navigate('/dashboard', { replace: true });
      } else {
        // Check if the response contains error details
        if (response.data && response.data.errors) {
          // Display the error message received from the server
          setResult(response.data.errors[0]);
        } else {
          setResult('Admin addition failed');
        }
      }
    } catch (error) {
      console.error('An error occurred while adding admin', error);
      setResult('Admin addition failed');
    }
  };

  const getToken = () => {
    return localStorage.getItem('jwtToken');
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
          name="email"
          label="Email"
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
        <Checkbox name="remember" defaultChecked />
        <RouterLink to="/dashboard">Go to dashboard</RouterLink>
      </Stack>

      {result && <p>{result}</p>}

      <LoadingButton fullWidth size="large" variant="contained" onClick={handleAdmin}>
        Add
      </LoadingButton>
    </>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const token = response.data.token || response.data.accessToken;
      const userRole = response.data.user?.role;

      if (!token) {
        setMessage('Login failed: No token received from server.');
        return;
      }

      // ✅ Store both token and role
      localStorage.setItem('token', token);
      if (userRole) {
        localStorage.setItem('role', userRole); // <-- unified key for role
      }

      setMessage('Login successful!');

      // ✅ Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

      // ✅ Refresh navbar and components
      window.location.reload();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  };

  return (
    <div
      className="login-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <div
        className="login-box"
        style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '1.5rem',
          boxShadow: '0 0 25px rgba(0,0,0,0.08)',
          minWidth: '360px',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '0.6rem',
            color: '#234',
            fontWeight: 700,
          }}
        >
          Login
        </h2>
        <p
          style={{
            textAlign: 'center',
            color: '#555',
            marginBottom: '1.5rem',
          }}
        >
          Sign in to report and track civic issues.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '0.7rem',
              borderRadius: '0.5rem',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '0.7rem',
              borderRadius: '0.5rem',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
          />

          <button
            type="submit"
            style={{
              padding: '0.7rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: '#234',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background 0.3s ease',
            }}
            onMouseOver={(e) => (e.target.style.background = '#345')}
            onMouseOut={(e) => (e.target.style.background = '#234')}
          >
            Login
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: '1rem',
              textAlign: 'center',
              color: message.includes('successful') ? 'green' : 'red',
              fontWeight: 500,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

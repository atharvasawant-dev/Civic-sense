import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const token = response.data.token || response.data.accessToken;
      const userRole = response.data.user?.role;

      if (!token) {
        setMessage('Login failed: No token received from server.');
        return;
      }

      localStorage.setItem('token', token);
      if (userRole) {
        localStorage.setItem('role', userRole);
      }

      setMessage('Login successful!');

      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

      window.location.reload();
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '8px' }}>Sign In</h2>
        <p style={{ textAlign: 'center', color: '#86868b', marginBottom: '32px' }}>Welcome back. Enter your details.</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Sign In
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('successful') ? 'message-success' : 'message-error'}`} style={{ marginTop: '20px', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#86868b' }}>
          Don't have an account? <span onClick={() => navigate('/register')} style={{ color: '#0071e3', cursor: 'pointer' }}>Register now</span>
        </p>
      </div>
    </div>
  );
};

export default Login;

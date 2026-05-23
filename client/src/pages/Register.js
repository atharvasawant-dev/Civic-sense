import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        localStorage.setItem('role', data.user.role);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Registration failed.');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '8px' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: '#86868b', marginBottom: '32px' }}>Join the community for a better city.</p>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} />

          <label>Email</label>
          <input type="email" name="email" placeholder="name@example.com" value={form.email} onChange={handleChange} />

          <label>Password</label>
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />

          <label>Account Type</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">Citizen</option>
            <option value="admin">Authority</option>
          </select>

          {error && <div className="message message-error" style={{ textAlign: 'center' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Register
          </button>
        </form>

        {success && <div className="message message-success" style={{ marginTop: '20px', textAlign: 'center' }}>Registration successful! Redirecting to login...</div>}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#86868b' }}>
          Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#0071e3', cursor: 'pointer' }}>Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default Register;

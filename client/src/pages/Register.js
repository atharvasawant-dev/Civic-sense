import React, { useState } from 'react';
import Footer from '../components/Footer';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        localStorage.setItem('userRole', data.user.role); // Store role for navigation
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Registration failed.');
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Register</h2>
        <p>Create your account to report and track civic issues.</p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="rounded border p-2" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="rounded border p-2" />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="rounded border p-2" />
          <select name="role" value={form.role} onChange={handleChange} className="rounded border p-2">
            <option value="user">User</option>
            <option value="admin">Admin (Authorities Only)</option>
          </select>
          {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
          <button type="submit" className="bg-blue-700 text-white py-2 px-6 rounded hover:bg-blue-900 transition">Register</button>
        </form>
        {success && <div className="success-message">Registration successful!</div>}
      </div>
      <Footer />
    </div>
  );
};

export default Register;

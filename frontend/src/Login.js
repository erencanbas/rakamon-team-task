import React, { useState } from 'react';
import axios from 'axios';
import './css/login.css'; 

const Login = ({ setToken }) => {
  const [tc_no, setTc] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3002/login', { tc_no: tc_no, password });
      setToken(res.data.jwtToken);
      localStorage.setItem('jwtToken', res.data.jwtToken);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="form-container">
          <h1 className="form-title">Task Management App</h1>
          <form onSubmit={handleLogin} className="form">
            <div>
              <label className="label">TC Identity Number</label>
              <input
                type="text"
                value={tc_no}
                onChange={(e) => setTc(e.target.value)}
                placeholder="Enter TC Identity Number"
                className="input"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="input"
              />
            </div>
            <button type="submit" className="button">
              Login
            </button>
          </form>
          {error && (
            <p className={`message ${error.includes('Invalid') ? 'error' : 'success'}`}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
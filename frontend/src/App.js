import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Login from './Login';
import TaskManager from './TaskManager';
import './index.css';

function App() {
  const [jwtToken, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          localStorage.removeItem('jwtToken');
        } else {
          setToken(storedToken);
        }
      } catch (err) {
        console.error('Invalid token in localStorage:', err);
        localStorage.removeItem('jwtToken');
      }
    }
  }, []);

  const user = jwtToken ? jwtDecode(jwtToken) : null;

  return (
    <div>
      {!jwtToken ? (
        <Login setToken={setToken} />
      ) : (
        <TaskManager token={jwtToken} user={user} setToken={setToken} />
      )}
    </div>
  );
}

export default App;
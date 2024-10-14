import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axiosConfig.js';
import { saveUser } from '../../data/userSlice.js'
import { useDispatch } from "react-redux";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();



  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });

      const data = response.data;

      if (data.success) {
        dispatch(saveUser(data.user));

        if (data.user.userType === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        const errorMessage = data.message || "Login failed. Please try again.";
        setError(errorMessage);
        window.alert(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An error occurred. Please try again.";
      setError(errorMessage);
      window.alert(errorMessage);
    }
  };

  return (
    <div className="session">
      <div className="left">
      </div>
      <form className="log-in" onSubmit={handleLogin}>
        <h4>Welcome <span>Admin</span></h4>
        <p>Welcome back! Log in to your account to view today's clients:</p>
        <div className="floating-label">
          <input
            placeholder="Email"
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />
          <label htmlFor="email">Email:</label>
          <div className="icon">
          </div>
        </div>
        <div className="floating-label">
          <input
            placeholder="Password"
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
          />
          <label htmlFor="password">Password:</label>
          <div className="icon">
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Log in</button>
      </form>
    </div>
  );
};

export default LoginPage;

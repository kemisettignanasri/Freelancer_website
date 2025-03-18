import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { employerLoginContext } from '../../contexts/employerLoginContext';
import { freelancerLoginContext } from '../../contexts/freelancerLoginContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();

  const { loginEmployer, employerLoginStatus, err: employerErr } = useContext(employerLoginContext);
  const { loginFreelancer, freelancerLoginStatus, err: freelancerErr } = useContext(freelancerLoginContext);

  useEffect(() => {
    if (employerLoginStatus) {
      navigate('/employerdashboard');
    }
  }, [employerLoginStatus, navigate]);
  
  useEffect(() => {
    if (freelancerLoginStatus) {
      navigate('/freelancerdashboard');
    }
  }, [freelancerLoginStatus, navigate]);
  
  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!username.trim()) {
      errors.username = 'Username or Email is required';
      isValid = false;
    }

    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        console.log('Login attempt with:', username, password);
        
          console.log('User found in Employer list, attempting Employer login...');
          await loginEmployer({ username, password });

          if (employerLoginStatus) {
            setLoginError(false);
            navigate('/employerdashboard');
            return;
          }
        
        
          console.log('User found in Freelancer list, attempting Freelancer login...');
          await loginFreelancer({ username, password });

          if (freelancerLoginStatus) {
            setLoginError(false);
            navigate('/freelancerdashboard');
            return;
          }
        
        setLoginError(true); 
      } catch (error) {
        console.error('Error logging in:', error);
        setLoginError(true);  
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {loginError && <p className="error" style={{ color: 'red', textAlign: 'center' }}>Invalid credentials! Please check your username or password.</p>}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="signup-link">
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
      <div className="login-image">
        <img
          src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?ixlib=rb-1.2.1&auto=format&fit=crop&w=1374&q=80"
          alt="Login Visual"
        />
      </div>
    </div>
  );
}

export default Login;
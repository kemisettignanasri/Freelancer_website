import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [errors, setErrors] = useState({});
  const [userExists, setUserExists] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!fullName.trim()) {
      errors.fullName = 'Full Name is required';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = '*Enter a valid email address';
      isValid = false;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      errors.mobileNumber = '*Enter a valid 10-digit mobile number';
      isValid = false;
    }

    if (password.length < 6) {
      errors.password = '*Password must be at least 6 characters long';
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = '*Passwords do not match';
      isValid = false;
    }

    if (!userType) {
      errors.userType = 'Please select a user type';
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Fetch employer and freelancer lists
        const [employerResponse, freelancerResponse] = await Promise.all([
          fetch('http://localhost:4000/employers-Api/employer'),
          fetch('http://localhost:4000/freelancers-Api/freelancer')
        ]);

        const employersData = await employerResponse.json();
        const employers = employersData.payload;

        const freelancersData = await freelancerResponse.json();
        const freelancers = freelancersData.payload;

        const userExists = employers?.find(emp => emp.fullName === fullName) ||
                           freelancers?.find(free => free.fullName === fullName);

        if (userExists) {
          setUserExists(true);
          return;
        }
        const newUser = { fullName, email, mobileNumber, password, userType };
        await fetch(
          userType === 'Employer'
            ? 'http://localhost:4000/employers-Api/register'
            : 'http://localhost:4000/freelancers-Api/register',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
          }
        );

        console.log('User registered successfully');
        navigate('/login');
      } catch (error) {
        console.error('Error registering user:', error);
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="fgroup">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
            />
            {errors.fullName && <span className="error" style={{ color: 'red' }}>{errors.fullName}</span>}
          </div>

          <div className="fgroup">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            {errors.email && <span className="error" style={{ color: 'red' }}>{errors.email}</span>}
          </div>

          <div className="fgroup">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              type="tel"
              id="mobileNumber"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Mobile number"
            />
            {errors.mobileNumber && <span className="error" style={{ color: 'red' }}>{errors.mobileNumber}</span>}
          </div>

          <div className="fgroup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            {errors.password && <span className="error" style={{ color: 'red' }}>{errors.password}</span>}
          </div>

          <div className="fgroup">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <span className="error" style={{ color: 'red' }}>{errors.confirmPassword}</span>}
          </div>

          <div className="fgroup">
            <label htmlFor="usertype">User Type</label>
            <select
              id="usertype"
              className="form-control"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="">Select user type</option>
              <option value="Employer">Employer</option>
              <option value="Freelancer">Freelancer</option>
            </select>
            {errors.userType && <span className="error" style={{ color: 'red' }}>{errors.userType}</span>}
          </div>

          <button type="submit" className="register-button">Register</button>
          {userExists && <p className="error" style={{ color: 'red' }}>Username already exists in the system!</p>}
        </form>
        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
      <div className="register-image">
        <img
          src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?ixlib=rb-1.2.1&auto=format&fit=crop&w=1374&q=80"
          alt="Register Visual"
        />
      </div>
    </div>
  );
}

export default Register;

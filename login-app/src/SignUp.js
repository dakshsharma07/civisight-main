import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Logo from './components/Logo/Logo';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    userType: '',
    organization: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false);

  const counties = ['Henry County'];
  const agencies = ['ACCG'];

  useEffect(() => {
    if (!auth || !db) {
      console.error('Firebase not initialized');
      setError('Firebase initialization failed');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'userType') {
      setShowCountyDropdown(value === 'county');
      setShowAgencyDropdown(value === 'agency');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!validateForm()) return;

      // Create user with email and password
      await createUserWithEmailAndPassword(auth, formData.email, formData.password)
        .then((userCredential) => {
          // User account created successfully
          const user = userCredential.user;
          
          // Update user profile
          updateProfile(user, {
            displayName: `${formData.firstName} ${formData.lastName}`
          });

          // Create user document in Firestore
          const userDocRef = doc(db, 'users', user.uid);
          setDoc(userDocRef, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            username: formData.username,
            userType: formData.userType,
            organization: formData.organization,
            createdAt: new Date(),
            lastLogin: new Date(),
            isActive: true,
            notificationPreferences: {
              email: true,
              sms: false,
              push: true
            }
          });

          // Redirect to home page
          navigate('/');
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error('Error creating user:', errorCode, errorMessage);
          throw error; // Re-throw to catch block
        });
    } catch (error) {
      console.error('Error signing up:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!formData.firstName.trim()) {
      setError('First name is required');
      isValid = false;
    } else if (!formData.lastName.trim()) {
      setError('Last name is required');
      isValid = false;
    } else if (!formData.email.trim()) {
      setError('Email is required');
      isValid = false;
    } else if (!formData.username.trim()) {
      setError('Username is required');
      isValid = false;
    } else if (!formData.password.trim()) {
      setError('Password is required');
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      isValid = false;
    } else if (!formData.userType) {
      setError('Please select your user type');
      isValid = false;
    } else if (!formData.organization) {
      setError('Please select your organization');
      isValid = false;
    }

    return isValid;
  };

  const getErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled';
      case 'auth/weak-password':
        return 'Password is too weak';
      default:
        return error.message;
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <Logo className="logo" size="large" />
        </div>
        <h1 className="login-heading">Create Account</h1>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="userType">User Type</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <option value="">Select your user type</option>
              <option value="county">County User</option>
              <option value="agency">State Agency User</option>
            </select>
          </div>

          {showCountyDropdown && (
            <div className="form-group">
              <label htmlFor="organization">County</label>
              <select
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
              >
                <option value="">Select your county</option>
                {counties.map((county) => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
          )}

          {showAgencyDropdown && (
            <div className="form-group">
              <label htmlFor="organization">Agency</label>
              <select
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
              >
                <option value="">Select your agency</option>
                {agencies.map((agency) => (
                  <option key={agency} value={agency}>{agency}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="form-group terms">
            <label htmlFor="terms">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                required
              />
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          {error && (
            <div className="error-message" style={{ color: 'red', marginTop: '1rem' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="signup-section">
          <span>Already have an account? </span>
          <Link to="/" className="signup-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

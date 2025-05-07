import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth) {
      console.error('Firebase auth not initialized');
      setError('Firebase initialization failed');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      await signInWithEmailAndPassword(auth, email, password);
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const getErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred';
    
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return error.message;
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-heading">Login</h1>
        
        {error && (
          <div className="error-message" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" aria-invalid={error ? 'true' : 'false'}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'email-error' : undefined}
            />
            {error && (
              <div id="email-error" className="error-message">
                {error}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" aria-invalid={error ? 'true' : 'false'}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'password-error' : undefined}
            />
            {error && (
              <div id="password-error" className="error-message">
                {error}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="rememberMe">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="login-button"
              disabled={loading}
              aria-disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="form-group">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot password?
            </Link>
          </div>

          <div className="form-group">
            <hr className="divider" />
            <p className="or-text">or</p>
          </div>

          <div className="form-group">
            <button type="button" className="oauth-button google">
              <span className="icon-google" aria-hidden="true"></span>
              Sign in with Google
            </button>
          </div>

          <div className="signup-section">
            <span>Don't have an account? </span>
            <Link to="/signup" className="signup-link">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

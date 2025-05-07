import React from 'react';
import './Logo.css';

const logo = '/assets/civisight-logo.png';

const Logo = ({ className = '', size = 'medium' }) => {
  return (
    <div className={`logo-container ${className}`}>
        <img
          src={logo}
          alt="CiviSight Logo"
          className={`logo ${size}`}
          loading="eager"
          style={{ maxWidth: '100%' }}
        />
    </div>
  );
};

export default Logo;

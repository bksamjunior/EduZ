import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
  return (
    <>
      <div className="welcome-container">
        <h1>Welcome to EduZ</h1>
        <p>This is your starting point. Explore and build something great!</p>
        
        <button>
          <Link to="/login">
            Get Started
          </Link>
        </button>
          
      </div>
    </>
  );
}

export default Welcome;

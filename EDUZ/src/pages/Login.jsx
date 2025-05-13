import React, { useState } from 'react';
import { SiGoogle, SiFacebook, SiGithub, SiDiscord, SiLinkedin } from 'react-icons/si';
import { MdLock, MdEmail} from 'react-icons/md';
import { Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    // Simple validation
    if (!email || !password) {
      setError('Both fields are required');
      return;
    }

    // Placeholder login logic
    if (email === 'user@example.com' && password === 'password123') {
      alert('Login successful!');
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h1>Login</h1>
        {error && <p className="error">{error}</p>}

        <h2>Using:</h2>

        <div className='social-login'>
          <SiGoogle className='logo-social'/>
          <SiFacebook className='logo-social'/>
          <SiGithub className='logo-social'/>
          <SiDiscord className='logo-social'/>
          <SiLinkedin className='logo-social'/>
        </div>

        <h2>Or:</h2>

        <div className='input-logo'>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <MdEmail className='info-icon'/>
        </div>

        <div className='input-logo'>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <MdLock className='info-icon'/>
        </div>
        <div className='remember-forgot'>
          <div className='remember-me'>
            <input 
              type="checkbox"
              name="remember-me"
            />
            <span>Remember Me</span>
          </div>
          
          <span className='forgot-password'><a>Forgot Password?</a></span>
        </div>
        
        <button type="submit">Login</button>
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;

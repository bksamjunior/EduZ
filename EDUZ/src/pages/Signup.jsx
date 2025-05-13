import React, { useState } from 'react';
import { SiGoogle, SiFacebook, SiGithub, SiDiscord, SiLinkedin } from 'react-icons/si';
import { MdLock, MdEmail, MdPerson} from 'react-icons/md';
import { Link } from 'react-router-dom';
import './Signup.css';

function Signup() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [checkpassword, setCheckPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !username || !password) {
      setError('All fields are required');
      return;
    }

    // Simulated signup logic
    console.log('User signed up:', { email, username, password });
    alert('Signup successful!');
    setError('');
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSignup} className="signup-form">
        <h1>Sign Up</h1>
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
            type='text'
            placeholder='First name'
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <MdPerson className='info-icon'/>
        </div>

        <div className='input-logo'>
          <input 
            type='text'
            placeholder='Last name'
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
          <MdPerson className='info-icon'/>
        </div>

        <div className='input-logo'>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <MdPerson className='info-icon'/>
        </div>

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

        <div className='input-logo'>
          <input
            type="password"
            placeholder='Check Password'
            value={checkpassword}
            onChange={(e) => setCheckPassword(e.target.value)}
          />
          <MdLock className='info-icon'/>
        </div>

        <button type="submit">Sign Up</button>

        <div className="login-link">
          <span>Already have an account?</span>
          <Link to="/login">
              Login
          </Link>
      </div>
      </form>

    </div>
  );
}

export default Signup;

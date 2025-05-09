import React from 'react';
import template_info from '../data/welcome_template.json'
import { Link } from 'react-router-dom';
import './Welcome.css';

function Render_template(){
  return(
    <>
      <h2>Explore our various options</h2>
      <div className="template">
      
      {
        template_info.map((template) => (
          <li key={template.id}>
            <div className="template-card">
              <h3>{template.user_type}</h3>
              <img src={template.img_src} alt={template.user_type} />
              <p>{template.description}</p>
              <button className="explore-button">Explore</button>
            </div>
          </li>
        ))
      }
      </div>
    </>
  );
}

function Welcome() {
  return (
    <>
      <div className="welcome-container">
        <h1>Welcome to EduZ</h1>
        <p>This is your starting point. Explore and build something great!</p>
        
        
          <Link to="/login">
            <button>
              Get Started
            </button>
          </Link>
       
        <Render_template />  
      </div>
    </>
  );
}

export default Welcome;

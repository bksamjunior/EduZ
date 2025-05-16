import React from 'react';
import './Individual.css';
import { Link } from 'react-router-dom';
import template_info from "../data/individual-template.json"

function Individual() {
  return (
    <div className='individual-container'>
      <h1>Explore EduZ as an Individual</h1>
      {/* <p>A platform which gives you the opportunity to share the greatness of education.</p> */}
     <div className='description'>
      <p>EduZ is a platform that empowers individuals to share their knowledge and skills with the world. Whether you're a teacher, tutor, or simply someone with a passion for learning, EduZ provides the tools you need to connect with others and make a difference.</p>
      
      <p>With EduZ, you can create and share your own courses, connect with students and other educators, and build a community of learners. Whether you're looking to teach a specific subject or simply share your knowledge, EduZ is the perfect platform for you.</p>
     </div>
      <h1>Your Options</h1>

    <div className='template-container'>
      {

        template_info.map((template) => (
          <div className="option" key={template.id}>
            <h2>{template.heading}</h2>
            <p>{template.description}</p>
          </div>
        ))

      }
    </div>

      <div className='button-container'>

        <div className="button">
          <h4>Login</h4>
          <p>I have an account</p>

          <Link>
            <button>
              Get Started
            </button>
          </Link>

        </div>

        <div className="button">
          <h4>Sign Up</h4>
          <p>I don't have an account</p>

          <Link>
            <button>
              Get Started
            </button>
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Individual;
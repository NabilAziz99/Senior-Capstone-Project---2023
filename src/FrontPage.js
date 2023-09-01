import React from 'react';
import { Link } from 'react-router-dom';
import Toolbar from './Toolbar';
import './FrontPage.css';
import img from './image/8knew.png';

function FrontPage() {
  return (
    <div className="page-background">
      <Toolbar />
      <div className="front-page">
        <div className="front-page-text">
          <div className="front-page-container">
            <h1>AI Resume Builder</h1>
            <h2>Powered by OpenAI's GPT-3 NLP model.</h2>
            <p>
              GPT-3 is an AI language model so powerful, it was at first deemed too dangerous to unleash on the world. Now you can use it to write your resume. And while that may seem like an overkill, GPT-3 is uniquely well-suited for generating structured documents such as resumes. Try it for free and see the results for yourself.
            </p>
            <div className="gray-line"></div>
            <ul>
              <li>The world’s most powerful natural language processing model</li>
              <li>Trained on hundreds of billions of words</li>
            </ul>
          </div>

          <Link to="/file-upload" className="start-button">
            Start!
          </Link>
        </div>
        <img src={img} alt="Front Page Image" className="front-page-image" />
      </div>
    </div>
  );
}

export default FrontPage;

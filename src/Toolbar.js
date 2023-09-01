import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Toolbar.css';
import logo from './image/8klogo.png';

function Toolbar() {
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const toggleFeatures = () => {
    setFeaturesOpen(!featuresOpen);
    setResumeOpen(false);
    setCoverLetterOpen(false);
    setPricingOpen(false);
  };

  const toggleResume = () => {
    setResumeOpen(!resumeOpen);
    setFeaturesOpen(false);
    setCoverLetterOpen(false);
    setPricingOpen(false);
  };

  const toggleCoverLetter = () => {
    setCoverLetterOpen(!coverLetterOpen);
    setFeaturesOpen(false);
    setResumeOpen(false);
    setPricingOpen(false);
  };

  const togglePricing = () => {
    setPricingOpen(!pricingOpen);
    setFeaturesOpen(false);
    setResumeOpen(false);
    setCoverLetterOpen(false);
  };
  useEffect(() => {
    const menuItems = document.querySelectorAll(".menu-item");
    const subMenus = document.querySelectorAll(".sub-menu");

    const handleMouseEnter = (e) => {
      const target = e.currentTarget;

      if (target.classList.contains("features")) {
        toggleFeatures();
      } else if (target.classList.contains("resume")) {
        toggleResume();
      } else if (target.classList.contains("cover-letter")) {
        toggleCoverLetter();
      } else if (target.classList.contains("pricing")) {
        togglePricing();
      }
    };

    const handleMouseLeave = () => {
      setTimeout(() => {
        setFeaturesOpen(false);
        setResumeOpen(false);
        setCoverLetterOpen(false);
        setPricingOpen(false);
      }, 200);
    };

    menuItems.forEach((menuItem) => {
      menuItem.addEventListener("mouseenter", handleMouseEnter);
      menuItem.addEventListener("mouseleave", handleMouseLeave);
    });

    subMenus.forEach((subMenu) => {
      subMenu.addEventListener("mouseenter", (e) => {
        e.stopPropagation();
      });
      subMenu.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      menuItems.forEach((menuItem) => {
        menuItem.removeEventListener("mouseenter", handleMouseEnter);
        menuItem.removeEventListener("mouseleave", handleMouseLeave);
      });

      subMenus.forEach((subMenu) => {
        subMenu.removeEventListener("mouseenter", (e) => {
          e.stopPropagation();
        });
        subMenu.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);


  return (
    <header className="header">
      <div className="main-background"></div>
      <div className="header-left">
        <div className="logo-container">
          <img src={logo} alt="Logo" />
        </div>
      </div>

      <div className="header-right-menu">
        <div className="menu-item features" onClick={toggleFeatures}>
          Features
          <i className="fas fa-angle-down"></i>
          {featuresOpen && (
            <ul className="sub-menu">
              <li>
                <a href="#">Option 1</a>
              </li>
              <li>
                <a href="#">Option 2</a>
              </li>
              <li>
                <a href="#">Option 3</a>
              </li>
            </ul>
          )}
        </div>
        <div className="menu-item resume" onClick={toggleResume}>
          Resume
          <i className="fas fa-angle-down"></i>
          {resumeOpen && (
            <ul className="sub-menu">
              <li>
                <a href="#">Option 4</a>
              </li>
              <li>
                <a href="#">Option 5</a>
              </li>
              <li>
                <a href="#">Option 6</a>
              </li>
            </ul>
          )}
        </div>
        <div className="menu-item cover-letter" onClick={toggleCoverLetter}>
          Cover Letter
          <i className="fas fa-angle-down"></i>
          {coverLetterOpen && (
            <ul className="sub-menu">
              <li>
                <a href="#">Option 7</a>
              </li>
              <li>
                <a href="#">Option 8</a>
              </li>
              <li>
                <a href="#">Option 9</a>
              </li>
            </ul>
          )}
        </div>
        <div className="menu-item pricing" onClick={togglePricing}>
          Pricing
          <i className="fas fa-angle-down"></i>
          {pricingOpen && (
            <ul className="sub-menu">
              <li>
                <a href="#">Option 10</a>
              </li>
              <li>
                <a href="#">Option 11</a>
              </li>
              <li>
                <a href="#">Option 12</a>
              </li>
            </ul>
          )}
        </div>
      </div>
      <div className="header-right-icons">
        <Link to="/login" className="login-box">
          Log In
        </Link>
        <Link to="/create-resume" className="create-resume-box">
          Try for free
        </Link>
      </div>
    </header>
  );
}
export default Toolbar;

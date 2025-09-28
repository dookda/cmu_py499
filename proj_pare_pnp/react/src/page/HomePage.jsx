// src/page/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import VideoCard from "../component/video-card";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="hero">
      {/* Navbar */}
      <nav className="navbar">
        <div className="social-icons">
          <a href="#">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#">
            <i className="fab fa-tumblr"></i>
          </a>
        </div>
        <ul className="nav-links">
          <nav>
            <Link to="/">Home</Link>
            <Link to="/map">Map</Link>
            <Link to="/traffic">Traffic</Link>
            <Link to="/aqicn">AQICN</Link>
          </nav>
        </ul>
      </nav>

      {/* Main Content + Video */}
      <div className="main-content">
        <div className="content">
          <h1>TRAFFIC HEAT MAP</h1>
          <p>
            การวิเคราะห์ความสัมพันธ์เชิงพื้นที่และเวลาระหว่างข้อมูล Google
            Traffic กับภูมิอากาศเมืองแบบ Near Real-Time: กรณีศึกษาเมืองเชียงใหม่
          </p>
          <button>GET STARTED</button>
        </div>
        <VideoCard />
      </div>
    </div>
  );
}

export default HomePage;

import { Link } from "react-router-dom";

import { Link } from "react-router-dom";

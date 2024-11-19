import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="hero">
        <h1>UnfamishedBusiness</h1>
        <p>Transforming your pantry into culinary masterpieces.</p>
        <div className="button-group">
          <button className="primary" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="secondary" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

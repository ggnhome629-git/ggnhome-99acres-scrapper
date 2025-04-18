import React from "react";

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
};

const Footer = () => {
  return (
    <footer
      style={{
        background: "linear-gradient(to right, #0f0c29, #302b63, #24243e)", // violet gradient
        color: "#fff",
        padding: "40px 20px",
        textAlign: "center",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        marginTop: "100px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1", minWidth: "200px", marginBottom: "20px" }}>
          <h3 style={{ color: "#8a2be2" }}>WeCode</h3>
          <p>Empowering developers with curated content and practice.</p>
        </div>
        <div style={{ flex: "1", minWidth: "200px", marginBottom: "20px" }}>
          <h4 style={{ color: "#8a2be2" }}>Quick Links</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><a href="#courses" style={linkStyle}>Courses</a></li>
            <li><a href="#about" style={linkStyle}>About</a></li>
            <li><a href="#dsa" style={linkStyle}>DSA</a></li>
            <li><a href="#devops" style={linkStyle}>DevOps</a></li>
          </ul>
        </div>
        <div style={{ flex: "1", minWidth: "200px", marginBottom: "20px" }}>
          <h4 style={{ color: "#8a2be2" }}>Connect</h4>
          <p>Email: <a href="mailto:support@wecode.com" style={linkStyle}>support@wecode.com</a></p>
          <p>Twitter: <a href="https://twitter.com/wecode" style={linkStyle}>@wecode</a></p>
          <p>LinkedIn: <a href="https://linkedin.com/company/wecode" style={linkStyle}>WeCode</a></p>
        </div>
      </div>
      <div style={{ marginTop: "30px", fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
        © {new Date().getFullYear()} WeCode. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
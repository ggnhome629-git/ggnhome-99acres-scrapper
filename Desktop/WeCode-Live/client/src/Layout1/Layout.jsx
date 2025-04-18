// src/components/Layout.jsx
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const layoutStyle = {
  fontFamily: "Arial",
  minHeight: "100vh",
  background: "linear-gradient(to bottom right, rgb(56, 17, 83), #000)",
  color: "#fff",
  paddingTop: "80px", // to avoid hiding behind fixed navbar
};

const Layout = ({ children }) => {
  return (
    <div style={layoutStyle}>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Typewriter = ({ text = "", speed = 80 }) => {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return (
    <div
      style={{
        fontSize: "64px",
        fontWeight: "bold",
        color: "#f0f6fc",
        whiteSpace: "pre-wrap",
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <span>{displayedText}</span>
      {index < text.length && (
        <span
          className="blinking-cursor"
          style={{
            width: "10px",
            height: "64px",
            marginLeft: "2px",
            backgroundColor: "#f0f6fc",
            animation: "blink 1s step-end infinite",
          }}
        ></span>
      )}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#0d1117",
        color: "#c9d1d9",
        minHeight: "100vh",
        padding: "0",
        margin: "0",
      }}
    >
      {/* Top Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 40px",
          borderBottom: "1px solid #21262d",
          backgroundColor: "#161b22",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/wecode logo.png"
            alt="WeCode Logo"
            style={{ width: "32px", height: "32px", marginRight: "8px" }}
          />
          <span style={{ fontSize: "24px", fontWeight: "bold", color: "#f0f6fc" }}>
            WeCode
          </span>
        </div>

        <div>
          <button
            onClick={() => navigate("/login")}
            style={{
              backgroundColor: "#238636",
              color: "#fff",
              padding: "8px 16px",
              fontSize: "14px",
              border: "none",
              borderRadius: "6px",
              marginRight: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{
              backgroundColor: "transparent",
              color: "#f0f6fc",
              padding: "8px 16px",
              fontSize: "14px",
              border: "1px solid #30363d",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          padding: "80px 20px 60px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <Typewriter text="Code Together. Learn Faster." speed={80} />

        <p
          style={{
            fontSize: "20px",
            color: "#8b949e",
            maxWidth: "700px",
            margin: "20px auto 40px",
          }}
        >
          WeCode is a collaborative platform for developers to code together in
          real-time, solve DSA problems, and ace interviews — all with seamless
          video chat and LeetCode integration.
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "15px 30px",
            fontSize: "20px",
            borderRadius: "8px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
        >
          Start Coding Now
        </button>
      </section>

      {/* Feature Grid */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
          padding: "40px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {[
          { title: "Live Code Editor", icon: "🧠" },
          { title: "Video & Audio Rooms", icon: "🎥" },
          { title: "DSA Practice Hub", icon: "📚" },
          { title: "Run Code Instantly", icon: "⚙️" },
          { title: "LeetCode Sync", icon: "🔗" },
          { title: "Secure Sessions", icon: "🔐" },
        ].map((feature) => (
          <div
            key={feature.title}
            style={{
              backgroundColor: "#161b22",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #30363d",
              textAlign: "center",
              transition: "transform 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>
              {feature.icon}
            </div>
            <h3 style={{ fontSize: "20px", color: "#f0f6fc" }}>
              {feature.title}
            </h3>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "40px 20px 20px",
          color: "#8b949e",
          borderTop: "1px solid #21262d",
          marginTop: "60px",
          fontSize: "14px",
        }}
      >
        Built with ❤️ by the WeCode Team • © 2025
      </footer>
    </div>
  );
};

export default HomeScreen;

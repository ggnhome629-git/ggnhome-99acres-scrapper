import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { handleLogout } from "../utils/Logout";
import { createroom, joinroom } from "../Rooms/room.jsx";
import { io } from "socket.io-client";
import axios from "axios";
const socket = io(process.env.REACT_APP_SOCKET_URL);

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
};

const Navbar = () => {
  const [showmenu, setShowmenu] = React.useState(false);
  const [joinRoomId, setJoinRoomId] = React.useState("");
  const [showJoinModal, setShowJoinModal] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDsaDashboard = location.pathname.startsWith("/dsadashboard");

  const handleToggleMenu = () => setShowmenu(!showmenu);
  const handleLogoutClick = () => {
    setShowmenu(false);
    handleLogout(navigate);
  };
  const handleNavigateTouser = () => {
    navigate("/userdetails");
  };
  const NavigateDashboard = () => {
    navigate("/dsadashboard");
  }

  const NavigateFeed = () => {
    navigate("/Feed");
  };

  const handleCreateRoom = async () => {
    try {
      const roomId = await createroom({ isReadOnly: true, fromNavbar: true });

      console.log("✅ Room Created in navbar:", roomId);
      navigate(`/room/${roomId}`, {
        state: {
          isReadOnly: true,
          fromNavbar: true
        }
      });
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  }

  const handleJoinRoom = async () => {
    if (!joinRoomId) {
      alert("Please enter a Room ID!");
      return;
    }
    try {
      const roomId = await joinroom(joinRoomId);

      console.log("✅ Room Joined in navbar:", roomId);
      setShowJoinModal(false);
      navigate(`/room/${roomId}`, {
        state: {
          isReadOnly: true,
          fromNavbar: true
        }
      });
    } catch (error) {
      console.error("❌ Failed to join room:", error);
      alert("Failed to join the room. Please check the Room ID and try again.");
    }
  };

  const handleNavigateToFollowDashboard = () => {
    navigate("/follow-dashboard");
  };

  const handleNavigateToUploadPost = () => {
    navigate("/upload-post");
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "80px",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingLeft: "20px",
        paddingRight: "5px",
        color: "#fff",
        zIndex: 10,
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        backdropFilter: "blur(10px)"
        
      }}
      
    >
      <div onClick={NavigateFeed} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
        <img src="/wecode logo.png" alt="WeCode Logo" style={{ height: "40px" }} />
        <span style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff" }}>WeCode</span>
      </div>

      <div style={{ display: "flex", gap: "25px", fontSize: "15px" }}>
        <span style={linkStyle} onClick={NavigateFeed}>Home</span>
        <a href="#courses" style={linkStyle}>Courses</a>
        <a href="#about" style={linkStyle}>About</a>
        <a href="#webdev" style={linkStyle}>Web Dev</a>
        <a href="#dsa" style={linkStyle} onClick={NavigateDashboard}>DSA</a>
        <a href="#devops" style={linkStyle}>DevOps</a>
      </div>
      {isDsaDashboard && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "10px" }}>
          <button onClick={handleCreateRoom} style={{
            padding: "8px 14px",
            color: "#fff",
            backgroundColor: "#6c5ce7",
            border: "none",
            borderRadius: "6px",
            fontWeight: "500",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(108, 92, 231, 0.4)",
            transition: "all 0.3s ease"
          }}>
            Create Room
          </button>
          <button
            onClick = {() => setShowJoinModal(true)}
            style={{
              padding: "8px 14px",
              color: "#fff",
              backgroundColor: "#6c5ce7",
              border: "none",
              borderRadius: "6px",
              fontWeight: "500",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(108, 92, 231, 0.4)",
              transition: "all 0.3s ease"
            }}
          >
            Join Room
          </button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ position: "relative" }}>
          <button
            onClick={handleToggleMenu}
            style={{
              background: "rgba(255,255,255,0.1)",
              padding: "15px 30px",
              backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.9), rgba(9, 21, 125, 0.6))`,
              borderRadius: "50%",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              cursor: "pointer",
              backdropFilter: "blur(5px)",
              marginRight: "40px",
            }}
          >
            Profile ▼
          </button>

          {showmenu && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                right: 0,
                backgroundColor: "rgba(0, 0, 0, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                padding: "10px",
                minWidth: "160px",
                zIndex: 20
                ,
              }}
            >
              <button onClick={handleNavigateTouser} style={{
                padding: "10px",
                color: "#fff",
                backgroundColor: "transparent",
                border: "none",
                textAlign: "left",
                width: "100%",
                cursor: "pointer",
                transition: "background 0.2s",
                borderRadius: "4px"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#1a1a1a"}
              onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>
                User Details
              </button>
              <button onClick={handleNavigateToFollowDashboard} style={{
                padding: "10px",
                color: "#fff",
                backgroundColor: "transparent",
                border: "none",
                textAlign: "left",
                width: "100%",
                cursor: "pointer",
                transition: "background 0.2s",
                borderRadius: "4px"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#1a1a1a"}
              onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>
                Follow Dashboard
              </button>
              <button onClick={handleNavigateToUploadPost} style={{
                padding: "10px",
                color: "#fff",
                backgroundColor: "transparent",
                border: "none",
                textAlign: "left",
                width: "100%",
                cursor: "pointer",
                transition: "background 0.2s",
                borderRadius: "4px"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#1a1a1a"}
              onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>
                Upload Post
              </button>
              <button onClick={() => console.log("Problem Solved clicked")} style={{
                padding: "10px",
                color: "#fff",
                backgroundColor: "transparent",
                border: "none",
                textAlign: "left",
                width: "100%",
                cursor: "pointer",
                transition: "background 0.2s",
                borderRadius: "4px"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#1a1a1a"}
              onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>
                Problem Solved
              </button>
              <button onClick={handleLogoutClick} style={{
                padding: "10px",
                color: "#fff",
                backgroundColor: "transparent",
                border: "none",
                textAlign: "left",
                width: "100%",
                cursor: "pointer",
                transition: "background 0.2s",
                borderRadius: "4px"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#1a1a1a"}
              onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>
                Logout
              </button>
            </div>
          )}
        </div>
        
      </div>
      {isDsaDashboard && showJoinModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "#14142b",
            padding: "30px",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
            border: "1px solid #6c5ce7",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            maxWidth: "300px",
            width: "90%"
          }}>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              style={{
                backgroundColor: "#1e1e2f",
                color: "#fff",
                border: "1px solid #6c5ce7",
                borderRadius: "8px",
                padding: "12px",
                outline: "none",
                width: "100%",
                fontSize: "1rem"
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleJoinRoom} style={{ padding: "8px 14px", color: "#fff", backgroundColor: "#6c5ce7", border: "none", borderRadius: "6px", fontWeight: "500", cursor: "pointer", boxShadow: "0 2px 8px rgba(108, 92, 231, 0.4)", transition: "all 0.3s ease" }}>
                Join Room
              </button>
              <button onClick={() => setShowJoinModal(false)} style={{ padding: "8px 14px", color: "#fff", backgroundColor: "#6c5ce7", border: "none", borderRadius: "6px", fontWeight: "500", cursor: "pointer", boxShadow: "0 2px 8px rgba(108, 92, 231, 0.4)", transition: "all 0.3s ease" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
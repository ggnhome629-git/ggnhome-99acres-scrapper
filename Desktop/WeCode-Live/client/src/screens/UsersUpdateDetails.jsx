import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { handleLogout } from "../utils/Logout";
import Layout from "../Layout1/Layout";
import Navbar from "../Layout1/Navbar";

const UserUpdateDetails = () => {
  const [showmenu, setshowmenu] = React.useState(false);
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [goals, setGoals] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
const [profileImage, setProfileImage] = useState("");
const [profileImageFile, setProfileImageFile] = useState(null);
const [message, setMessage] = React.useState("");

  // Follower and following counts
  const [followingCount, setFollowingCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_USER_PROFILE, {
          withCredentials: true,
        });

        const data = res.data.user;
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setBio(data.bio || "");
        setGoals(data.goals || "");
        setGithub(data.github || "");
        setLinkedin(data.linkedin || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const fetchFollowCounts = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_FOLLOW_DASHBOARD, {
          withCredentials: true,
        });
        setFollowingCount(res.data.following_count);
        setFollowerCount(res.data.followed_count);
      } catch (error) {
        console.error("Error fetching follow counts:", error);
      }
    };

    fetchUserProfile();
    fetchFollowCounts();
  }, []);

const handleProfileImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setProfileImageFile(file);
    setProfileImage(URL.createObjectURL(file)); // Optional preview
  }
};

const Updateprofile = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("phone", phone);
  formData.append("bio", bio);
  formData.append("goals", goals);
  formData.append("github", github);
  formData.append("linkedin", linkedin);
  if (profileImageFile) {
    formData.append("profileImage", profileImageFile);
  }

  try {
    const response = await axios.post(
      process.env.REACT_APP_USER_UPDATE_PROFILE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    setMessage("Data Updated Successfully");
  } catch (error) {
    console.error("Upload error:", error);
    if (error.response && error.response.data && error.response.data.message) {
      setMessage(error.response.data.message);
    } else {
      setMessage("An error occurred while updating.");
    }
  }
};

  const handleLogoutClick = () => {
    setshowmenu(false);
    handleLogout(navigate);
  };

  const handleToggleMenu = () => {
    setshowmenu(!showmenu);
  };

  

  return (
    <Layout>
      <Navbar
        showMenu={showmenu}
        onToggleMenu={handleToggleMenu}
        onLogout={handleLogoutClick}
        
      />

      <div
        className="user-form-container"
        style={{
          padding: "40px",
          maxWidth: "600px",
          margin: "50px auto",
          backgroundColor: "#000",
          border: "2px solid violet",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(138, 43, 226, 0.5)",
          marginTop: "100px",
        }}
      >
        <h2 className="form-title" style={{ textAlign: "center", color: "violet", marginBottom: "25px" }}>
          User Profile
        </h2>
        <form className="user-form" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            style={inputStyle}
          />
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={inputStyle}
          />
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={inputStyle}
          />
          <input
            name="phone"
            placeholder="Phone"
            style={inputStyle}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <textarea
            name="bio"
            placeholder="Short bio..."
            style={inputStyle}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <textarea
            name="goals"
            placeholder="What are your goals?"
            style={inputStyle}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
          />
          <input
            name="github"
            placeholder="GitHub URL"
            style={inputStyle}
            value={github}
            onChange={(e) => setGithub(e.target.value)}
          />
          <input
            name="linkedin"
            placeholder="LinkedIn URL"
            style={inputStyle}
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
          <input
            type="file"
            name="profileimage"
            accept="image/*"
            onChange={handleProfileImageChange}
            style={inputStyle}
          />
          <button type="submit" onClick={Updateprofile} style={buttonStyle}>
            Update Profile
          </button>
          {message && (
            <p style={{ color: message === "Username already taken." ? "red" : "green" }}>
              {message}
            </p>
          )}
        </form>

        <div style={{ marginTop: "20px", color: "white" }}>
          <p>Following: {followingCount}</p>
          <p>Followers: {followerCount}</p>
        </div>
      </div>
    </Layout>
  );
};

const inputStyle = {
  padding: "12px",
  border: "1px solid #8a2be2",
  borderRadius: "5px",
  backgroundColor: "#111",
  color: "#fff",
  fontSize: "14px",
};

const buttonStyle = {
  padding: "12px",
  backgroundColor: "#8a2be2",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  fontWeight: "bold",
  cursor: "pointer",
};

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
};

export default UserUpdateDetails;

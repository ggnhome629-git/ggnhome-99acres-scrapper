import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import Navbar from "../Layout1/Navbar.jsx";
import Footer from "../Layout1/Footer.jsx";
import { motion, AnimatePresence } from "framer-motion";

const FollowDashboard = () => {
  const [followingName, setFollowingName] = useState("");
  const [followedName, setFollowedName] = useState("");
  const [message, setMessage] = useState("");
  const [isFollowing, setIsFollowing] = useState(false); // Track the following status
  const [followingCount, setFollowingCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false); // New state for showing profile
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRef = useRef(null);

  const [recentSearches, setRecentSearches] = useState([]);

  // Fetch the current user's name and follow counts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_USER_PROFILE, {
          withCredentials: true,
        });
        const user = res.data.user;
        setFollowingName(user.name);
        setFollowerCount(user.followed_count || 0);
        setFollowingCount(user.following_count || 0);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage("Error fetching user data");
      }
    };

    fetchUserData();

    if (followedName) {
      checkFollowingStatus();
    }
  }, [followedName]);
    
  // Check if the user is already following the followed user
  const checkFollowingStatus = async () => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_CHECK_FOLLOWING,
        {
          following_name: followingName,
          followed_name: followedName,
        },
        {
          withCredentials: true,
        }
      );
      setIsFollowing(response.data.isFollowing); // Set the follow status
    } catch (error) {
      console.error("Error checking following status:", error);
    }
  };

  // Handle following a user
  const handleFollow = async () => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_FOLLOW,
        {
          following_name: followingName,
          followed_name: followedName,
        },
        {
          withCredentials: true,
        }
      );
        setMessage(response.data.message);
        setIsFollowing(true);
      
    } catch (error) {
      setMessage(error.response?.data?.message || "Error following user");
    }
  };

  // Handle unfollowing a user
  const handleUnfollow = async () => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_UNFOLLOW,
        {
          following_name: followingName,
          followed_name: followedName,
        },
        {
          withCredentials: true,
        }
      );
      setMessage(response.data.message);
      checkFollowingStatus(); // Check if we are no longer following the user
    } catch (error) {
      setMessage(error.response?.data?.message || "Error unfollowing user");
    }
  };

  const debouncedSearchUsers = useCallback(
    debounce(async (query) => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_SEARCH_USERS}?searchQuery=${query}`,
          { withCredentials: true }
        );
        console.log("Search Results:", res.data.users);
        setSearchResults(res.data.users);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    }, 400),
    []
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ padding: "2rem", backgroundColor: "#000", color: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}
    >
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem", position: "relative" }}>
        <div ref={dropdownRef} style={{ marginTop: "50px", position: "relative", width: "400px" }}>
          <input
            type="text"
            placeholder="Username to follow/unfollow"
            value={followedName}
            onChange={(e) => {
              const value = e.target.value;
              setFollowedName(value);
              setShowProfile(false);
              if (value.trim() !== "") {
                debouncedSearchUsers(value);
              } else {
                setSearchResults([]);
              }
            }}
            style={{
              padding: "0.5rem",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#111",
              color: "#fff",
              width: "100%",
              marginBottom: "0.5rem"
            }}
          />
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: "0.5rem",
                  backgroundColor: "#111",
                  border: "1px solid #333",
                  borderRadius: "5px",
                  position: "absolute",
                  width: "100%",
                  zIndex: 1000,
                }}
              >
                {searchResults.map((user) => (
                  <li
                    key={user._id}
                onClick={() => {
                      setFollowedName(user.name);
                      setSelectedUser(user);
                      setShowProfile(true);
                      setSearchResults([]);
                      setRecentSearches((prev) => {
                        const updated = [user, ...prev.filter((u) => u._id !== user._id)];
                        return updated.slice(0, 5);
                      });
                      checkFollowingStatus();
                    }}
                    style={{
                      padding: "0.5rem",
                      cursor: "pointer",
                      color: "#fff",
                      borderBottom: "1px solid #333",
                    }}
                  >
                    {user.name}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (followedName.trim()) {
                debouncedSearchUsers(followedName);
              }
            }}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              cursor: "pointer",
              marginTop: "0.5rem",
              transition: "background-color 0.3s ease",
            }}
          >
            Search
          </motion.button>
        </div>
      </div>
      <div style={{ maxWidth: "800px", margin: "0 auto", marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "#ccc" }}>Recent Searches</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {recentSearches.map((user) => (
            <div
              key={user._id}
              style={{
                backgroundColor: "#111",
                borderRadius: "10px",
                padding: "1rem",
                width: "calc(25% - 1rem)",
                minWidth: "180px",
                color: "#fff",
                textAlign: "center",
              }}
            >
              <img
                src={`https://api.dicebear.com/7.x/micah/svg?seed=${user.name}`}
                alt={user.name}
                style={{ width: "60px", borderRadius: "50%", marginBottom: "0.5rem" }}
              />
              <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{user.name}</div>
              <button
                onClick={() => {
                  setFollowedName(user.name);
                  setSelectedUser(user);
                  setShowProfile(true);
                  setRecentSearches([]);
                  checkFollowingStatus();
                }}
                style={{
                  padding: "0.3rem 0.6rem",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
      <br />
      {showProfile && selectedUser && (
        <div style={{
          backgroundColor: "#111",
          border: "1px solid #333",
          borderRadius: "10px",
          padding: "2rem",
          marginTop: "3rem",
          maxWidth: "900px",
          marginInline: "auto"
        }}>
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{ display: "flex", alignItems: "center",marginTop: "2.5rem", gap: "3rem", marginBottom: "2rem" }}
        >
          <img
            src={`https://api.dicebear.com/7.x/micah/svg?seed=${selectedUser.name}`}
            alt="Profile"
            style={{ borderRadius: "50%", width: "150px", height: "150px", objectFit: "cover" }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <h2 style={{ fontWeight: "normal", fontSize: "1.5rem" }}>{selectedUser.name}</h2>
              <span style={{ color: "#0af", fontSize: "1.2rem" }}>✔️</span>
              <button
                onClick={isFollowing ? handleUnfollow : handleFollow}
                style={{
                  backgroundColor: "#0095f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
              <button style={{ backgroundColor: "#333", color: "#fff", padding: "0.4rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer" }}>
                Message
              </button>
              <button style={{ backgroundColor: "#333", color: "#fff", padding: "0.4rem", borderRadius: "8px", border: "none", cursor: "pointer" }}>
                ⋯
              </button>
            </div>
            <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
              <span><strong>{followerCount}</strong> followers</span>
              <span><strong>{followingCount}</strong> following</span>
            </div>
          </div>
          </motion.div>
        </div>
      )}
      <Footer />
    </motion.div>
  );
};

export default FollowDashboard;
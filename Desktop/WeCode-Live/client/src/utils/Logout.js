// client/src/utils/Logout.js
import axios from "axios";

export const handleLogout = async (navigate) => {
  try {
    await axios.post(
      process.env.REACT_APP_LOGOUT_URI,
      {},
      { withCredentials: true }
    );
    navigate("/login");
  } catch (error) {
    console.error("Logout failed", error);
  }
};
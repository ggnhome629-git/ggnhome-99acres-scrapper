import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import Dashboard from "./screens/DSAdashboard";
import UserDetails from "./screens/UserDetails";
import CustomRoom from "./Rooms/CustomRoom";
import Livechatroom from "./Rooms/livechatroom";
import FollowDashboard from "./screens/FollowDashboard";
import UserUpdateDetails from "./screens/UsersUpdateDetails";
import Feed from "./screens/Feed";
import "./App.css";
import UploadPosts from "./Rooms/UploadPosts";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/userdetails" element={<UserDetails />} />
        <Route path="/userupdatedetails" element={<UserUpdateDetails />} />
        <Route path="/dsadashboard" element={<Dashboard />} />
        <Route path="/follow-dashboard" element={<FollowDashboard />} />
        <Route path="/upload-post" element={<UploadPosts />} />
        <Route path="/room/:roomId" element={<CustomRoom />} />
        <Route path="/questionroom/:publicroomID" element={<Livechatroom />} />
        <Route path="/Feed" element={<Feed />} />
        <Route path="/customroom/:publicRoomId/:privateRoomId" element={<CustomRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
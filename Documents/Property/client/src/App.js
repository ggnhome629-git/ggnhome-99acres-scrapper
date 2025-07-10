import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ShineOneEstateForm from "./Screens/Form/form"
import ShineOneEstate from "./Screens/Dashboard/dashboard";
import AdminPostForm from "./Screens/Admin/admin";
import ShineOneEstateHome from "./Screens/HomePage/Homepage";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<ShineOneEstateHome />} />
          <Route path="/form" element={<ShineOneEstateForm />} />
          <Route path="/properties" element={<ShineOneEstate />} />
          <Route path="/admin1025s" element={<AdminPostForm />} />
          
        </Routes>
      </Router>
    </div>
  )
}

export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminPropertyDashboard = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Form state for add/update
  const [form, setForm] = useState({
    price: "",
    pricePerSqFt: "",
    area: "",
    size: "",
    locality: "",
    tags: "",
    featured: false,
    preferred: false,
    address: "",
    status: "Available",
  });

  const [images, setImages] = useState([]);

  // Load properties for update/delete operations
  useEffect(() => {
    if (activeTab === "update" || activeTab === "delete") {
      fetchProperties();
    }
  }, [activeTab]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch(process.env.REACT_APP_API_GET_POSTS);
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setMessage("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleImages = (e) => {
    setImages([...e.target.files]);
  };

  const resetForm = () => {
    setForm({
      price: "",
      pricePerSqFt: "",
      area: "",
      size: "",
      locality: "",
      tags: "",
      featured: false,
      preferred: false,
      address: "",
      status: "Available",
    });
    setImages([]);
    setSelectedProperty(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage("");
    resetForm();
  };

  // Add Property
  const handleAddProperty = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append images
    images.forEach((file) => {
      formData.append("posts", file);
    });

    // Append form fields
    for (let key in form) {
      if (key === "tags") {
        formData.append(key, form[key].split(",").map(tag => tag.trim()));
      } else {
        formData.append(key, form[key]);
      }
    }

    try {
      setLoading(true);
      const response = await fetch(process.env.REACT_APP_API_ADD_PROPERTY, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        setMessage("Property added successfully!");
        resetForm();
      } else {
        setMessage("Failed to add property.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to add property.");
    } finally {
      setLoading(false);
    }
  };

  // Update Property
  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    if (!selectedProperty) {
      setMessage("Please select a property to update.");
      return;
    }

    const formData = new FormData();

    // Append ID
    formData.append("id", selectedProperty._id);

    // Append images
    images.forEach((file) => {
      formData.append("posts", file);
    });

    // Append form fields
    for (let key in form) {
      if (key === "tags") {
        formData.append(key, form[key].split(",").map(tag => tag.trim()));
      } else {
        formData.append(key, form[key]);
      }
    }

    try {
      setLoading(true);
      const response = await fetch(process.env.REACT_APP_API_UPDATE_PROPERTY, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        setMessage("Property updated successfully!");
        fetchProperties();
        resetForm();
      } else {
        setMessage("Failed to update property.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to update property.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Property
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      setLoading(true);
      // Simulated API call - replace with actual axios call
      console.log("Deleting property:", propertyId);
      await axios.delete(`${process.env.REACT_APP_API_DELETE_PROPERTY_BASE}/${propertyId}`);
      setMessage("Property deleted successfully!");
      fetchProperties();
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete property.");
    } finally {
      setLoading(false);
    }
  };

  // Select property for update
  const selectPropertyForUpdate = (property) => {
    setSelectedProperty(property);
    setForm({
      price: property.price || "",
      pricePerSqFt: property.pricePerSqFt || "",
      area: property.area || "",
      size: property.size || "",
      locality: property.locality || "",
      tags: property.tags ? property.tags.join(", ") : "",
      featured: property.featured || false,
      preferred: property.preferred || false,
      address: property.address || "",
      status: property.status || "Available",
    });
  };

  // Styles
  const containerStyle = {
    padding: "20px",
    maxWidth: "800px",
    margin: "auto",
    fontFamily: "Arial, sans-serif"
  };

  const tabContainerStyle = {
    display: "flex",
    marginBottom: "20px",
    borderBottom: "2px solid #ddd"
  };

  const tabStyle = {
    padding: "12px 24px",
    cursor: "pointer",
    backgroundColor: "#f5f5f5",
    border: "none",
    borderBottom: "2px solid transparent",
    margin: "0 5px 0 0",
    borderRadius: "5px 5px 0 0"
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: "#007bff",
    color: "white",
    borderBottom: "2px solid #007bff"
  };

  const inputStyle = {
    display: "block",
    marginBottom: "10px",
    width: "100%",
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px"
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px"
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#dc3545"
  };

  const propertyCardStyle = {
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: "#f9f9f9"
  };

  const messageStyle = {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "4px",
    backgroundColor: message.includes("success") ? "#d4edda" : "#f8d7da",
    color: message.includes("success") ? "#155724" : "#721c24",
    border: message.includes("success") ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Admin Property Dashboard</h1>
      
      {/* Tab Navigation */}
      <div style={tabContainerStyle}>
        <button
          style={activeTab === "add" ? activeTabStyle : tabStyle}
          onClick={() => handleTabChange("add")}
        >
          Add Property
        </button>
        <button
          style={activeTab === "update" ? activeTabStyle : tabStyle}
          onClick={() => handleTabChange("update")}
        >
          Update Property
        </button>
        <button
          style={activeTab === "delete" ? activeTabStyle : tabStyle}
          onClick={() => handleTabChange("delete")}
        >
          Delete Property
        </button>
      </div>

      {/* Add Property Tab */}
      {activeTab === "add" && (
        <div>
          <h2>Add New Property</h2>
          <div onSubmit={handleAddProperty}>
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <input
              type="number"
              name="pricePerSqFt"
              placeholder="Price per SqFt"
              value={form.pricePerSqFt}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <input
              type="number"
              name="area"
              placeholder="Area (sqft)"
              value={form.area}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <input
              type="number"
              name="size"
              placeholder="Size (sq yards)"
              value={form.size}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <input
              type="text"
              name="locality"
              placeholder="Locality"
              value={form.locality}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <input
              type="text"
              name="tags"
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
            </select>
            <label style={{ marginBottom: "10px", display: "block" }}>
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
              />
              {" "}Featured
            </label>
            <label style={{ marginBottom: "10px", display: "block" }}>
              <input
                type="checkbox"
                name="preferred"
                checked={form.preferred}
                onChange={handleChange}
              />
              {" "}Preferred
            </label>
            <input
              type="file"
              name="posts"
              multiple
              onChange={handleImages}
              style={{ ...inputStyle, padding: "5px" }}
              accept="image/*"
            />
            <button type="button" style={buttonStyle} onClick={handleAddProperty} disabled={loading}>
              {loading ? "Adding..." : "Add Property"}
            </button>
          </div>
        </div>
      )}

      {/* Update Property Tab */}
      {activeTab === "update" && (
        <div>
          <h2>Update Property</h2>
          {loading && <p>Loading properties...</p>}
          {!selectedProperty && (
            <div>
              <h3>Select a property to update:</h3>
              {properties.map((property) => (
                <div key={property._id} style={propertyCardStyle}>
                  <h4>{property.locality} - ₹{property.price}</h4>
                  <p>Area: {property.area} sqft | Size: {property.size} sq yards | Status: {property.status}</p>
                  <p>Price/SqFt: ₹{property.pricePerSqFt}</p>
                  <p>Address: {property.address}</p>
                  <p>Tags: {property.tags?.join(", ")}</p>
                  <p>Featured: {property.featured ? "Yes" : "No"} | Preferred: {property.preferred ? "Yes" : "No"}</p>
                  <button
                    style={buttonStyle}
                    onClick={() => selectPropertyForUpdate(property)}
                  >
                    Select for Update
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {selectedProperty && (
            <div>
              <h3>Updating Property: {selectedProperty.locality}</h3>
              <button
                style={{ ...buttonStyle, backgroundColor: "#6c757d", marginBottom: "15px" }}
                onClick={() => resetForm()}
              >
                Back to Selection
              </button>
              <div onSubmit={handleUpdateProperty}>
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={form.price}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <input
                  type="number"
                  name="pricePerSqFt"
                  placeholder="Price per SqFt"
                  value={form.pricePerSqFt}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <input
                  type="number"
                  name="area"
                  placeholder="Area (sqft)"
                  value={form.area}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <input
                  type="number"
                  name="size"
                  placeholder="Size (sq yards)"
                  value={form.size}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <input
                  type="text"
                  name="locality"
                  placeholder="Locality"
                  value={form.locality}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <input
                  type="text"
                  name="tags"
                  placeholder="Tags (comma separated)"
                  value={form.tags}
                  onChange={handleChange}
                  style={inputStyle}
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={form.address}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                </select>
                <label style={{ marginBottom: "10px", display: "block" }}>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                  />
                  {" "}Featured
                </label>
                <label style={{ marginBottom: "10px", display: "block" }}>
                  <input
                    type="checkbox"
                    name="preferred"
                    checked={form.preferred}
                    onChange={handleChange}
                  />
                  {" "}Preferred
                </label>
                <input
                  type="file"
                  name="posts"
                  multiple
                  onChange={handleImages}
                  style={{ ...inputStyle, padding: "5px" }}
                  accept="image/*"
                />
                <button type="button" style={buttonStyle} onClick={handleUpdateProperty} disabled={loading}>
                  {loading ? "Updating..." : "Update Property"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Property Tab */}
      {activeTab === "delete" && (
        <div>
          <h2>Delete Property</h2>
          {loading && <p>Loading properties...</p>}
          <div>
            <h3>Select a property to delete:</h3>
            {properties.map((property) => (
              <div key={property._id} style={propertyCardStyle}>
                <h4>{property.locality} - ₹{property.price}</h4>
                <p>Area: {property.area} sqft | Size: {property.size} sq yards | Status: {property.status}</p>
                <p>Price/SqFt: ₹{property.pricePerSqFt}</p>
                <p>Address: {property.address}</p>
                <p>Tags: {property.tags?.join(", ")}</p>
                <p>Featured: {property.featured ? "Yes" : "No"} | Preferred: {property.preferred ? "Yes" : "No"}</p>
                <button
                  style={dangerButtonStyle}
                  onClick={() => handleDeleteProperty(property._id)}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete Property"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && <div style={messageStyle}>{message}</div>}
    </div>
  );
};

export default AdminPropertyDashboard;
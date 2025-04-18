import React, { useState } from "react";
import axios from "axios";

const UploadPosts = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || images.length === 0) {
      setMessage("Please fill all fields and upload images.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    images.forEach((image) => formData.append("posts", image));

    try {
      const response = await axios.post(
        process.env.REACT_APP_UPLOAD_POST_URI,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setMessage("Posts uploaded successfully!");
      setTitle("");
      setDescription("");
      setImages([]);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Failed to upload posts.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Upload Posts</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", height: "100px" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <input
            type="file"
            name="posts"
            multiple
            onChange={handleImageChange}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#8a2be2",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Upload
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>
      )}
    </div>
  );
};

export default UploadPosts;

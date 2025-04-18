import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Layout1/Navbar.jsx";
import { formatDistanceToNow } from 'date-fns';

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [name , setName] = useState('');

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_FETCH_FEED, {
          withCredentials: true,
        });
        setPosts(response.data.posts);
        setName(response.data.name);
      } catch (error) {
        console.error("Error fetching feed:", error);
      }
    };

    fetchFeed();
  }, []);

  return (
    <>
      <Navbar />
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        paddingTop: '80px'
      }}>
        <h1 style={{
          color: 'white',
          marginBottom: '24px',
          fontSize: '28px',
          fontWeight: '600'
        }}>Your Feed</h1>
        
        {posts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 0',
            color: '#aaa'
          }}>
            <p style={{ fontSize: '18px' }}>No posts from followed users yet.</p>
            <p>Follow more users to see their content here</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              style={{
                backgroundColor: '#1e1e1e',
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s',
                ':hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid #8a2be2',
                  marginRight: '12px',
                  boxShadow: '0 0 8px rgba(138, 43, 226, 0.5)'
                }}>
                  <img 
                    src={post.user.profilePicture || `https://ui-avatars.com/api/?name=${post.user.name?.charAt(0) || "U"}&background=8a2be2&color=fff&size=40`} 
                    alt={post.user?.username || "User"}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <p style={{ 
                    margin: 0, 
                    fontWeight: '600',
                    fontSize: '15px'
                  }}>{post.user.username}</p>
                  <p style={{ 
                    margin: 0, 
                    color: '#aaa',
                    fontSize: '12px'
                  }}>
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              
              {post.title && (
                <h3 style={{
                  margin: '8px 0',
                  fontSize: '18px'
                }}>{post.title}</h3>
              )}
              
              <p style={{
                margin: '8px 0 16px',
                color: '#e0e0e0',
                lineHeight: '1.5'
              }}>{post.description}</p>
              
              {post.mediaUrl && (
                <div style={{
                  margin: '12px 0',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <img
                    src={post.mediaUrl}
                    alt="post"
                    style={{ 
                      width: '100%',
                      maxHeight: '500px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div style={{
                display: 'flex',
                paddingTop: '8px',
                borderTop: '1px solid #333'
              }}>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: '#aaa',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '20px',
                  cursor: 'pointer'
                }}>
                  <span style={{ marginRight: '6px' }}>👍</span>
                  Like
                </button>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: '#aaa',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '20px',
                  cursor: 'pointer'
                }}>
                  <span style={{ marginRight: '6px' }}>💬</span>
                  Comment
                </button>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: '#aaa',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}>
                  <span style={{ marginRight: '6px' }}>↗️</span>
                  Share
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Feed;
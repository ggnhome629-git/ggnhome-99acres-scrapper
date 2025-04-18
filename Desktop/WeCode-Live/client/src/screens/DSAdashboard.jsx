import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import quoteList from "../utils/quotes.js";
import { handleLogout } from "../utils/Logout.js";
import Layout from "../Layout1/Layout.jsx";
import Navbar from "../Layout1/Navbar.jsx";
import { createroom, joinroom } from "../Rooms/room.jsx";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL);

const Dashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [quote, setQuote] = useState("");
  const [showmenu, setshowmenu] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setQuote(quoteList[Math.floor(Math.random() * quoteList.length)]);
  }, []);

  useEffect(() => {
    const fetchExcel = async () => {
      const response = await fetch("/questions.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setQuestions(data);
      fetchResponse();
    };
    fetchExcel();
  }, []);

  const handleCreateRoom = async (question, customState = {}) => {
    const roomId = slugify(question.Title);
    const roomData = {
      roomId,
      title: question.Title,
      statement: question["Problem Statement"],
      difficulty: question.Difficulty,
      sampleInput: question["Sample Input"],
      sampleOutput: question["Sample Output"],
      constraints: question.Constraints,
    };

    try {
      const response = await axios.get(process.env.REACT_APP_ROOM_CREATE, {
        withCredentials: true,
      });
      const privateRoomId = response.data.roomId;

      navigate(`/customroom/${roomId}/${privateRoomId}`, {
        state: { question: roomData, ...customState }
      });
    } catch (error) {
      console.error("❌ Failed to create private room:", error);
    }
  }

  const handleJoinRoom = async (question) => {
    const privateRoomId = prompt(`Enter private room ID for "${question.Title}"`);
    console.log("Private Room ID:", privateRoomId);
    
    if (!privateRoomId) return;
  
    try {
      await axios.post(
        process.env.REACT_APP_ROOM_JOIN,
        { roomId: privateRoomId },
        { withCredentials: true }
      );
  
      console.log("✅ Joined Room:", privateRoomId);
  
      const publicRoomId = slugify(question.Title);
      console.log("Navigating to room...");
navigate(`/customroom/${publicRoomId}/${privateRoomId}` , {
        state: {
          question: {
            title: question.Title,
            statement: question["Problem Statement"],
            difficulty: question.Difficulty,
            sampleInput: question["Sample Input"],
            sampleOutput: question["Sample Output"],
            constraints: question.Constraints,
          },
        },
});
    } catch (error) {
      const errMsg = error?.response?.data?.message;
  
      console.log("❌ Room join failed:", errMsg);
      
    }
  };

  const handleUpdateQuestion = async (index, field, value) => {
    const updatedQuestions = [...questions];
    const newValue = value === "Yes" ? "No" : "Yes";
    try {
      const response = await axios.post(
        process.env.REACT_APP_UPDATE_QUESTION_URI,
        {
          questionId: updatedQuestions[index].Title,
          field,
          value: newValue,
        },
        { withCredentials: true }
      );
      updatedQuestions[index][field] = newValue;
      setQuestions(updatedQuestions);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchResponse = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_FETCH_DASHBOARD, {
        withCredentials: true,
      });
      const { importantQuestions, revisionQuestions } = response.data;

      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => {
          const isImportant = importantQuestions.some(
            (iq) => iq.questionId === q.Title
          );
          const isRevision = revisionQuestions.some(
            (rq) => rq.questionId === q.Title
          );
          return {
            ...q,
            Important: isImportant ? "Yes" : "No",
            Revision: isRevision ? "Yes" : "No",
          };
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogoutClick = () => {
    setshowmenu(false);
    handleLogout(navigate);
  };

  const handleToggleMenu = () => {
    setshowmenu(!showmenu);
  };

  const handleNavigateToDashboard = () => {
    navigate("/dsadashboard");
  };

  const slugify = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleJoinQuestionRoom = (title) => {
    const publicroomID = slugify(title);
    navigate(`/questionroom/${publicroomID}`);
  };

  const handleSolvequestion = (question) => {
    handleCreateRoom(question, { hideRoomId: true });
  } 

  return (
    <Layout>
      <Navbar
        showMenu={showmenu}
        onToggleMenu={handleToggleMenu}
        onLogout={handleLogoutClick}
        onDashboard={handleNavigateToDashboard}
      />

      <h1 style={{ textAlign: "center", fontSize: "3rem", color: "#fff", marginTop: "140px", marginBottom: "30px", fontWeight: "700" }}>
        {quote}
      </h1>

      <div style={tableContainerStyle}>
        <h2 style={{ color: "white", textAlign: "center", marginBottom: "20px" }}>DSA Questions</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "black" }}>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Difficulty</th>
              <th style={thStyle}>Revision</th>
              <th style={thStyle}>Submitted</th>
              <th style={thStyle}>Solve</th>
              <th style={thStyle}>Join Room</th>
              <th style={thStyle}>Private Room</th>
              <th style={thStyle}>Join Private Room</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, index) => (
              <tr
                key={index}
                style={{
                  transition: "transform 0.2s ease, background-color 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.01)";
                  e.currentTarget.style.backgroundColor = "#2a2a45";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = "";
                }}
              >
                <td style={tdStyle}>{q.Title}</td>
                <td style={tdStyle}>{q.Difficulty}</td>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={q.Revision === "Yes"}
                    onChange={() => handleUpdateQuestion(index, "Revision", q.Revision)}
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={q.Important === "Yes"}
                    onChange={() => handleUpdateQuestion(index, "Important", q.Important)}
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td style={tdStyle}>
                  <button
                    style={actionBtnStyle1}
                    title="Submit Solution"
                    onClick={() => handleSolvequestion(q)}
                  >
                    Submit
                  </button>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => handleJoinQuestionRoom(q.Title)} style={buttonStyle} title="Join public room for this question">
                    Join Room
                  </button>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => handleCreateRoom(q)} style={buttonStyle} title="Create a private room">
                    Create Room
                  </button>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleJoinRoom(q)}
                    style={buttonStyle}
                    title="Join a private room"
                  >
                    Join Private
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

// --- Styles ---

const buttonStyle = {
  backgroundColor: "#6c5ce7",
  padding: "10px 20px",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 2px 10px rgba(108, 92, 231, 0.3)",
  "&:hover": {
    backgroundColor: "#5c4dcf",
  },
};

const inputStyle = {
  backgroundColor: "#1e1e2f",
  color: "#fff",
  border: "1px solid #6c5ce7",
  borderRadius: "8px",
  padding: "10px",
  outline: "none",
};

const tableContainerStyle = {
  background: "#1e1e2f",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 8px 40px rgba(0, 0, 0, 0.3)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  margin: "40px auto",
  maxWidth: "1200px",
};

const thStyle = {
  borderBottom: "2px solid #6c5ce7",
  padding: "12px",
  color: "#fff",
  fontWeight: "600",
  backgroundColor: "#14142b",
};

const tdStyle = {
  padding: "12px",
  color: "#dcdde1",
  textAlign: "center",
  backgroundColor: "#20203a",
};

const actionBtnStyle1 = {
  marginRight: "10px",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  background: "#00cec9",
  color: "#fff",
  cursor: "pointer",
  transition: "0.3s ease",
};

const actionBtnStyle2 = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  background: "#e84393",
  color: "#fff",
  cursor: "pointer",
  transition: "0.3s ease",
};

export default Dashboard;
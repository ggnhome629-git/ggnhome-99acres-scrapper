import axios from "axios";

// Load values from your .env file
const JUDGE0_API = process.env.REACT_APP_JUDGE0_API;
const RAPID_API_KEY = process.env.REACT_APP_RAPID_API_KEY;
const RAPID_API_HOST = process.env.REACT_APP_RAPID_API_HOST;

export const runCodeWithJudge0 = async ({ source_code, language_id, stdin = "" }) => {
  try {
    const submissionRes = await axios.post(
      `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
      {
        source_code,
        language_id,
        stdin,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": RAPID_API_KEY,
          "X-RapidAPI-Host": RAPID_API_HOST,
        },
      }
    );

    return submissionRes.data;
  } catch (error) {
    console.error("❌ Error submitting code to Judge0:", error.response?.data || error.message);
    throw error;
  }
};

export default runCodeWithJudge0;
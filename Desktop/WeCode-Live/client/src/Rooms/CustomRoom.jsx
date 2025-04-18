import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import CodeEditor from "./CodeEditor";
import Layout from "../Layout1/Layout";
import { Box, Text, Button, Code } from "@chakra-ui/react";
import { runCodeWithJudge0 } from "../utils/judge0";
import axios from "axios";
import { problemHandlers } from "./HandlerQuestions";

const CustomRoom = () => {
  const { publicRoomId, privateRoomId } = useParams();
  const { roomId } = useParams();
  const location = useLocation();
  const { question = {} } = location.state || {};
    
  const isReadOnly = location.state?.isReadOnly || false;
  const fromNavbar = location.state?.fromNavbar || false;
  const hideRoomId = location.state?.hideRoomId;

  const [output, setOutput] = useState("");
  const [languageId, setLanguageId] = useState(63); // Default to JavaScript
  const [testCases, setTestCases] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [initialCode, setInitialCode] = useState(`console.log("Hello, World!");`); // Added state for initial code
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchDefaultCode = async () => {
      const title = question?.title || publicRoomId?.replace(/-/g, " ");
      if (!title) return;

      try {
        const res = await axios.get(`${process.env.REACT_APP_TESTCASE_API}/default/${title}`);
        const defaultCode = res.data.defaultCode;

        window.defaultQuestionCode = {
          ...window.defaultQuestionCode,
          [title.toLowerCase()]: {
            javascript: defaultCode
          }
        };

        setInitialCode(defaultCode); // set the code locally too
      } catch (err) {
        console.error("Failed to fetch default code:", err);
      }
    };

    fetchDefaultCode();
  }, [question?.title, publicRoomId]);

  const handleRunCode = async () => {
    let code = editorRef.current?.getValue();
    if (!code || !question?.title) {
      setOutput("Editor is empty or no question loaded.");
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_TESTCASE_API}/${question.title}`);
      const testCasesFromAPI = res.data;
      setTestCases(testCasesFromAPI);

      const results = [];

      for (const test of testCasesFromAPI) {
        const inputStr = test.Input; // e.g., "nums = [2,7,11,15], target = 9"

        const title = question.title?.toLowerCase();
        const handlerKey = Object.keys(problemHandlers).find(key =>
          title.includes(key)
        );

        if (!handlerKey) {
          console.warn("⚠️ No handler found for title:", title);
          continue;
        }

        let fullCode = "";
        try {
          if (!inputStr || typeof inputStr !== "string") throw new Error("Missing input string");
          fullCode = problemHandlers[handlerKey](inputStr, code);
        } catch (err) {
          console.warn("⚠️ Error while preparing code:", err.message);
          continue;
        }

        console.log("🔧 Running test case with:");
        console.log("Source code:", fullCode);
        console.log("Language ID:", languageId);

        const result = await runCodeWithJudge0({
          source_code: fullCode,
          language_id: languageId,
          stdin: "",
        });

        const output = result.stdout?.trim() || result.stderr?.trim() || "No output";
        const expected = test["Expected Output"].toString().trim();

        let passed = false;
        try {
          const parsedOutput = JSON.stringify(eval(output));
          const parsedExpected = JSON.stringify(eval(expected));
          passed = parsedOutput === parsedExpected;
        } catch (err) {
          console.warn("⚠️ Could not parse output/expected:", output, expected);
        }

        results.push({
          input: test.Input,
          expected,
          output,
          passed,
        });
      }

      setTestResults(results);
    } catch (error) {
      setOutput("Error running code.");
      console.error(error);
    }
  };

  return (
    <Layout>
      <Box width="100%" textAlign="center" mt={6}>
        {publicRoomId ? (
          <Text fontSize="lg" fontWeight="semibold" color="white">
            Public Room ID: {publicRoomId || "N/A"} 
            {!hideRoomId && <> || Private Room ID: {privateRoomId || "N/A"}</>}
          </Text>
        ) : roomId ? (
          <Text fontSize="lg" fontWeight="semibold" color="white">
            Room ID: {roomId}
          </Text>
        ) : null}
      </Box>
      {!isReadOnly && !fromNavbar && <Box display="flex" height="100vh" width="100%" p={4}>
        {/* Left side - Room Info and Language Selector */}
        <Box width="50%" pr={4} overflowY="auto" maxHeight="90vh">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            {question.title || "Custom Room"} - {publicRoomId}
          </Text>
          <Text mb={2}><strong>Difficulty:</strong> {question.difficulty}</Text>
          <Text mb={2}><strong>Statement:</strong> {question.statement}</Text>
          <Text mb={2}><strong>Sample Input:</strong> {question.sampleInput}</Text>
          <Text mb={2}><strong>Sample Output:</strong> {question.sampleOutput}</Text>
          <Text mb={2}><strong>Constraints:</strong> {question.constraints}</Text>
        </Box>

        {/* Right side - Code Editor */}
        <Box width="50%" height="30%" marginTop={"10px"}>
          <CodeEditor
            editorRef={editorRef}
            languageId={languageId}
            setLanguageId={setLanguageId}
            initialCode={initialCode} // Updated to use local state
          />
          <Button mt={4} colorScheme="blue" onClick={handleRunCode}>
            Run Code
          </Button>
          <Box mt={4}>
            <Text fontWeight="bold">Output:</Text>
            <Code whiteSpace="pre-wrap">{output}</Code>
          </Box>
          {testResults.length > 0 && (
            <Box mt={6}>
              <Text fontWeight="bold" mb={2}>Test Case Results:</Text>
              <Box as="table" width="100%" border="1px solid #ccc" borderRadius="md">
                <thead>
                  <tr>
                    <th>Input</th>
                    <th>Expected</th>
                    <th>Output</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((test, idx) => (
                    <tr key={idx}>
                      <td><Code>{test.input}</Code></td>
                      <td><Code>{test.expected}</Code></td>
                      <td><Code>{test.output}</Code></td>
                      <td style={{ color: test.passed ? "green" : "red" }}>
                        {test.passed ? "✅ Passed" : "❌ Failed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>
          )}
        </Box>
      </Box>}
    </Layout>
  );
};

export default CustomRoom;
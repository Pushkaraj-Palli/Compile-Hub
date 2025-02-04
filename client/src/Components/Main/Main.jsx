import React, { useState } from "react";
import "./Main.css";
import LangList from "../LangList/LangList";
import { useLanguage } from "../../context/LanguageContext";

//////////////
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

function Main() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [lineCount, setLineCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedLanguage, fileExtension } = useLanguage();

  const handleCodeChange = (e) => {
    const text = e.target.value;
    setCode(text);
    const lines = text.split("\n").length;
    setLineCount(lines);
  };

  const handleRun = async () => {
    setIsLoading(true);
    try {
      const endpoint = `/api/run-${selectedLanguage}`;
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.error) {
        setOutput(data.error);
      } else {
        setOutput(
          data.output || "Program executed successfully with no output"
        );
      }
    } catch (error) {
      setOutput("Error connecting to server: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setOutput("");
  };

  return (
    <>
      <div className="main">
        <div className="header">
          <p className="app_name">Compile-Hub</p>
          <button>Sign In</button>
        </div>

        <div className="editor_main">
          <LangList />

          <div className="editor_space">
            <div className="editor_buttons">
              <p id="filename">{`main${fileExtension}`}</p>
              <button>Theme</button>
              <button>Share</button>
              <button>Save</button>
              <button onClick={handleRun} disabled={isLoading} id="runBtn">
                {isLoading ? "Running..." : "Run"}
              </button>
            </div>

            <div className="code-editor-container">
              <div className="line-numbers">
                {[...Array(lineCount)].map((_, index) => (
                  <div key={index} className="line-number">
                    {index + 1}
                  </div>
                ))}
              </div>

              <div className="editor-content">
                <div className="syntax-highlight-wrapper">
                  <SyntaxHighlighter
                    language={selectedLanguage}
                    style={atomOneDark}
                    wrapLines={true}
                    showLineNumbers={false}
                    customStyle={{
                      margin: 0,
                      padding: "10px",
                      background: "transparent",
                      fontSize: "14px",
                      fontFamily: "monospace",
                      lineHeight: "1.5",
                      height: "100%",
                      width: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      pointerEvents: "none",
                    }}
                  >
                    {code}
                  </SyntaxHighlighter>
                  <textarea
                    className="code_input"
                    value={code}
                    onChange={handleCodeChange}
                    spellCheck={false}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                  />
                </div>
              </div>

              {/* 123 */}
            </div>
          </div>

          <div className="terminal">
            <div className="output_header">
              <p>Output</p>
              <button onClick={handleClear}>Clear</button>
            </div>
            <div className="output">
              <textarea
                readOnly
                value={output}
                placeholder="Output will be displayed here"
                className="output_text"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;


import React, { useState, useRef, useEffect } from "react";
import "./Main.css";
import LangList from "../LangList/LangList";
import { useLanguage } from "../../context/LanguageContext";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

function Main() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [lineCount, setLineCount] = useState(1);
  const [terminalContent, setTerminalContent] = useState([]);
  const terminalRef = useRef(null);
  const { selectedLanguage, fileExtension } = useLanguage();
  const wsRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    wsRef.current = new WebSocket('ws://localhost:5000');

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'output') {
        setTerminalContent(prev => [...prev, { type: 'output', content: message.data }]);
        scrollToBottom();
      } else if (message.type === 'input-request') {
        setTerminalContent(prev => [...prev, { type: 'input-request', content: message.data }]);
        scrollToBottom();
      } else if (message.type === 'program-end') {
        setIsRunning(false);
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  const handleCodeChange = (e) => {
    const text = e.target.value;
    setCode(text);
    const lines = text.split("\n").length;
    setLineCount(lines);
  };

  const handleTerminalInput = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && isRunning) {
      e.preventDefault();
      const input = currentInput.trim();
      setTerminalContent(prev => [...prev, { type: 'input', content: input }]);
      wsRef.current.send(JSON.stringify({ type: 'input', data: input }));
      setCurrentInput('');
      scrollToBottom();
    }
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    
    setIsRunning(true);
    setTerminalContent([]);
    
    try {
      wsRef.current.send(JSON.stringify({
        type: 'run',
        language: selectedLanguage,
        code: code
      }));
    } catch (error) {
      setTerminalContent([{ type: 'error', content: 'Failed to start program: ' + error.message }]);
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setTerminalContent([]);
    setCurrentInput('');
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
              <button 
                onClick={handleRun} 
                disabled={isRunning} 
                id="runBtn"
              >
                {isRunning ? "Running..." : "Run"}
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
            </div>
          </div>

          <div className="terminal">
            <div className="output_header">
              <p>Terminal</p>
              <button onClick={handleClear}>Clear</button>
            </div>
            <div className="terminal-content" ref={terminalRef}>
              {terminalContent.map((item, index) => (
                <div 
                  key={index} 
                  className={`terminal-line ${item.type}`}
                >
                  {item.type === 'input' && '> '}
                  {item.content}
                </div>
              ))}
              {isRunning && (
                <div className="terminal-input-line">
                  <span className="prompt">{'> '}</span>
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleTerminalInput}
                    disabled={!isRunning}
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 5000;
const tempDir = path.join(__dirname, "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

const safeDeleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

const languages = {
  python: { command: "python", extension: ".py", needsCompilation: false },
  javascript: { command: "node", extension: ".js", needsCompilation: false },
  c: {
    command: "gcc",
    extension: ".c",
    needsCompilation: true,
    compileCommand: "gcc",
  },
  cpp: {
    command: "g++",
    extension: ".cpp",
    needsCompilation: true,
    compileCommand: "g++",
  },
  java: {
    command: "java",
    extension: ".java",
    needsCompilation: true,
    compileCommand: "javac",
  },
};

wss.on('connection', (ws) => {
  let currentProcess = null;

  ws.on('message', async (message) => {
    const data = JSON.parse(message);

    if (data.type === 'run') {
      if (currentProcess) {
        currentProcess.kill();
      }

      const { language, code } = data;
      const langConfig = languages[language];
      
      if (!langConfig) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          data: 'Unsupported language' 
        }));
        return;
      }

      let sourceFilePath = null;
      let outputFilePath = null;

      try {
        // Create source file
        if (language === 'java') {
          sourceFilePath = path.join(tempDir, 'Main.java');
        } else {
          sourceFilePath = path.join(tempDir, `temp_${Date.now()}${langConfig.extension}`);
        }

        fs.writeFileSync(sourceFilePath, code);

        // Handle compilation if needed
        if (langConfig.needsCompilation) {
          if (language === 'java') {
            await new Promise((resolve, reject) => {
              const compiler = spawn('javac', [sourceFilePath]);
              let error = '';

              compiler.stderr.on('data', (data) => {
                error += data.toString();
              });

              compiler.on('close', (code) => {
                if (code !== 0) {
                  reject(new Error(error));
                } else {
                  resolve();
                }
              });
            });

            currentProcess = spawn('java', ['-cp', tempDir, 'Main']);
          } else {
            outputFilePath = path.join(tempDir, `output_${Date.now()}`);
            await new Promise((resolve, reject) => {
              const compiler = spawn(langConfig.compileCommand, [
                sourceFilePath,
                '-o',
                outputFilePath
              ]);
              let error = '';

              compiler.stderr.on('data', (data) => {
                error += data.toString();
              });

              compiler.on('close', (code) => {
                if (code !== 0) {
                  reject(new Error(error));
                } else {
                  resolve();
                }
              });
            });

            currentProcess = spawn(outputFilePath);
          }
        } else {
          currentProcess = spawn(langConfig.command, [sourceFilePath]);
        }

        // Handle process I/O
        currentProcess.stdout.on('data', (data) => {
          ws.send(JSON.stringify({ 
            type: 'output', 
            data: data.toString() 
          }));
        });

        currentProcess.stderr.on('data', (data) => {
          ws.send(JSON.stringify({ 
            type: 'output', 
            data: data.toString() 
          }));
        });

        currentProcess.on('close', () => {
          ws.send(JSON.stringify({ type: 'program-end' }));
          currentProcess = null;
          
          // Cleanup files
          if (sourceFilePath) safeDeleteFile(sourceFilePath);
          if (outputFilePath) safeDeleteFile(outputFilePath);
        });

      } catch (error) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          data: error.message 
        }));
        
        // Cleanup files on error
        if (sourceFilePath) safeDeleteFile(sourceFilePath);
        if (outputFilePath) safeDeleteFile(outputFilePath);
      }
    } else if (data.type === 'input' && currentProcess) {
      currentProcess.stdin.write(data.data + '\n');
    }
  });

  ws.on('close', () => {
    if (currentProcess) {
      currentProcess.kill();
    }
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Temp directory path: ${tempDir}`);
});
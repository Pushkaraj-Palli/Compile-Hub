// const express = require("express");
// const { spawn } = require("child_process");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");

// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());

// // Helper function to execute code with compilation if needed
// const executeCode = async (command, args, code, extension, needsCompilation = false, compileCommand = null, compileArgs = []) => {
//   try {
//     const tempDir = path.join(__dirname, "temp");
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir);
//     }

//     const fileName = `temp_${Date.now()}${extension}`;
//     const filePath = path.join(tempDir, fileName);
//     fs.writeFileSync(filePath, code);

//     if (needsCompilation) {
//       // For compiled languages (C, C++, Java)
//       const outputPath = path.join(tempDir, `output_${Date.now()}`);

//       // Compile the code
//       const compiler = spawn(compileCommand, [...compileArgs, filePath, '-o', outputPath]);

//       let compileError = '';

//       await new Promise((resolve, reject) => {
//         compiler.stderr.on('data', (data) => {
//           compileError += data.toString();
//         });

//         compiler.on('close', (code) => {
//           if (code !== 0) {
//             reject(new Error(compileError));
//           }
//           resolve();
//         });
//       });

//       // Execute the compiled program
//       const process = spawn(outputPath);
//       let output = '';
//       let error = '';

//       process.stdout.on('data', (data) => {
//         output += data.toString();
//       });

//       process.stderr.on('data', (data) => {
//         error += data.toString();
//       });

//       const result = await new Promise((resolve) => {
//         process.on('close', (code) => {
//           // Clean up
//           fs.unlinkSync(filePath);
//           fs.unlinkSync(outputPath);

//           resolve({
//             status: code,
//             output: output,
//             error: error
//           });
//         });
//       });

//       return result;
//     } else {
//       // For interpreted languages (Python, JavaScript)
//       const process = spawn(command, [...args, filePath]);
//       let output = '';
//       let error = '';

//       process.stdout.on('data', (data) => {
//         output += data.toString();
//       });

//       process.stderr.on('data', (data) => {
//         error += data.toString();
//       });

//       const result = await new Promise((resolve) => {
//         process.on('close', (code) => {
//           fs.unlinkSync(filePath);
//           resolve({
//             status: code,
//             output: output,
//             error: error
//           });
//         });
//       });

//       return result;
//     }
//   } catch (err) {
//     throw err;
//   }
// };

// // Route for Python
// app.post("/api/run-python", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     const result = await executeCode("python", [], code, ".py");
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       error: "Server error",
//       details: err.message,
//     });
//   }
// });

// // Route for JavaScript
// app.post("/api/run-javascript", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     const result = await executeCode("node", [], code, ".js");
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       error: "Server error",
//       details: err.message,
//     });
//   }
// });

// // Route for C
// app.post("/api/run-c", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     const result = await executeCode(
//       null,
//       [],
//       code,
//       ".c",
//       true,
//       "gcc",
//       []
//     );
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       error: "Compilation error",
//       details: err.message,
//     });
//   }
// });

// // Route for C++
// app.post("/api/run-cpp", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     const result = await executeCode(
//       null,
//       [],
//       code,
//       ".cpp",
//       true,
//       "g++",
//       ["-std=c++11"]  // Using C++11 standard
//     );
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       error: "Compilation error",
//       details: err.message,
//     });
//   }
// });

// // Route for Java
// app.post("/api/run-java", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     // For Java, we need to extract the class name from the code
//     const classMatch = code.match(/public\s+class\s+(\w+)/);
//     if (!classMatch) {
//       return res.status(400).json({
//         error: "Invalid Java code",
//         details: "Could not find public class name"
//       });
//     }
//     const className = classMatch[1];

//     const tempDir = path.join(__dirname, "temp");
//     const fileName = `${className}.java`;
//     const filePath = path.join(tempDir, fileName);

//     // Write the code to a file
//     fs.writeFileSync(filePath, code);

//     // Compile Java code
//     const compiler = spawn("javac", [filePath]);
//     let compileError = '';

//     await new Promise((resolve, reject) => {
//       compiler.stderr.on('data', (data) => {
//         compileError += data.toString();
//       });

//       compiler.on('close', (code) => {
//         if (code !== 0) {
//           reject(new Error(compileError));
//         }
//         resolve();
//       });
//     });

//     // Run Java program
//     const process = spawn("java", ["-cp", tempDir, className]);
//     let output = '';
//     let error = '';

//     process.stdout.on('data', (data) => {
//       output += data.toString();
//     });

//     process.stderr.on('data', (data) => {
//       error += data.toString();
//     });

//     const result = await new Promise((resolve) => {
//       process.on('close', (code) => {
//         // Clean up
//         fs.unlinkSync(filePath);
//         fs.unlinkSync(path.join(tempDir, `${className}.class`));

//         resolve({
//           status: code,
//           output: output,
//           error: error
//         });
//       });
//     });

//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       error: "Compilation error",
//       details: err.message,
//     });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

////////////////////////////////////////////////////////////////////////////////////////////////

// const express = require("express");
// const { spawn } = require("child_process");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");

// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());

// // Helper function to safely delete a file
// const safeDeleteFile = (filePath) => {
//   try {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//   } catch (error) {
//     console.error(`Error deleting file ${filePath}:`, error);
//   }
// };

// // Helper function to execute code with compilation if needed
// const executeCode = async (command, args, code, extension, needsCompilation = false, compileCommand = null, compileArgs = []) => {
//   const tempDir = path.join(__dirname, "temp");
//   let sourceFilePath = null;
//   let outputFilePath = null;

//   try {
//     // Create temp directory if it doesn't exist
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir);
//     }

//     // Create source file
//     const fileName = `temp_${Date.now()}${extension}`;
//     sourceFilePath = path.join(tempDir, fileName);
//     fs.writeFileSync(sourceFilePath, code);

//     if (needsCompilation) {
//       // For compiled languages (C, C++, Java)
//       outputFilePath = path.join(tempDir, `output_${Date.now()}.exe`);

//       // Add output file flag to compile arguments
//       const fullCompileArgs = [...compileArgs, sourceFilePath, '-o', outputFilePath];

//       // Compile the code
//       const compiler = spawn(compileCommand, fullCompileArgs);

//       let compileError = '';

//       await new Promise((resolve, reject) => {
//         compiler.stderr.on('data', (data) => {
//           compileError += data.toString();
//         });

//         compiler.on('close', (code) => {
//           if (code !== 0) {
//             reject(new Error(compileError));
//           }
//           resolve();
//         });
//       });

//       // Execute the compiled program
//       const process = spawn(outputFilePath);
//       let output = '';
//       let error = '';

//       process.stdout.on('data', (data) => {
//         output += data.toString();
//       });

//       process.stderr.on('data', (data) => {
//         error += data.toString();
//       });

//       const result = await new Promise((resolve) => {
//         process.on('close', (code) => {
//           resolve({
//             status: code,
//             output: output,
//             error: error
//           });
//         });
//       });

//       return result;
//     } else {
//       // For interpreted languages (Python, JavaScript)
//       const process = spawn(command, [...args, sourceFilePath]);
//       let output = '';
//       let error = '';

//       process.stdout.on('data', (data) => {
//         output += data.toString();
//       });

//       process.stderr.on('data', (data) => {
//         error += data.toString();
//       });

//       const result = await new Promise((resolve) => {
//         process.on('close', (code) => {
//           resolve({
//             status: code,
//             output: output,
//             error: error
//           });
//         });
//       });

//       return result;
//     }
//   } catch (err) {
//     throw err;
//   } finally {
//     // Clean up files in the finally block
//     if (sourceFilePath) {
//       safeDeleteFile(sourceFilePath);
//     }
//     if (outputFilePath) {
//       safeDeleteFile(outputFilePath);
//     }
//   }
// };

// // Route for C
// app.post("/api/run-c", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     const result = await executeCode(
//       null,
//       [],
//       code,
//       ".c",
//       true,
//       "gcc",
//       []
//     );
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       error: "Compilation error",
//       details: err.message,
//     });
//   }
// });

// // Route for C++
// app.post("/api/run-cpp", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     const result = await executeCode(
//       null,
//       [],
//       code,
//       ".cpp",
//       true,
//       "g++",
//       ["-std=c++11"]
//     );
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       error: "Compilation error",
//       details: err.message,
//     });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// const express = require("express");
// const { spawn } = require("child_process");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");

// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());

// // Helper function to safely delete a file
// const safeDeleteFile = (filePath) => {
//   try {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//   } catch (error) {
//     console.error(`Error deleting file ${filePath}:`, error);
//   }
// };

// // Helper function to execute code with compilation if needed
// const executeCode = async (
//   command,
//   args,
//   code,
//   extension,
//   needsCompilation = false,
//   compileCommand = null,
//   compileArgs = []
// ) => {
//   const tempDir = path.join(__dirname, "temp");
//   let sourceFilePath = null;
//   let outputFilePath = null;

//   try {
//     // Create temp directory if it doesn't exist
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir);
//     }

//     // Create source file
//     const fileName = `temp_${Date.now()}${extension}`;
//     sourceFilePath = path.join(tempDir, fileName);
//     fs.writeFileSync(sourceFilePath, code);

//     if (needsCompilation) {
//       // For compiled languages (C, C++, Java)
//       outputFilePath = path.join(tempDir, `output_${Date.now()}.exe`);

//       // Add output file flag to compile arguments
//       const fullCompileArgs = [
//         ...compileArgs,
//         sourceFilePath,
//         "-o",
//         outputFilePath,
//       ];

//       // Compile the code
//       const compiler = spawn(compileCommand, fullCompileArgs);

//       let compileError = "";

//       await new Promise((resolve, reject) => {
//         compiler.stderr.on("data", (data) => {
//           compileError += data.toString();
//         });

//         compiler.on("close", (code) => {
//           if (code !== 0) {
//             reject(new Error(compileError));
//           }
//           resolve();
//         });
//       });

//       // Execute the compiled program
//       const process = spawn(outputFilePath);
//       let output = "";
//       let error = "";

//       process.stdout.on("data", (data) => {
//         output += data.toString();
//       });

//       process.stderr.on("data", (data) => {
//         error += data.toString();
//       });

//       const result = await new Promise((resolve) => {
//         process.on("close", (code) => {
//           resolve({
//             status: code,
//             output: output,
//             error: error,
//           });
//         });
//       });

//       return result;
//     } else {
//       // For interpreted languages (Python, JavaScript)
//       const process = spawn(command, [...args, sourceFilePath]);
//       let output = "";
//       let error = "";

//       process.stdout.on("data", (data) => {
//         output += data.toString();
//       });

//       process.stderr.on("data", (data) => {
//         error += data.toString();
//       });

//       const result = await new Promise((resolve) => {
//         process.on("close", (code) => {
//           resolve({
//             status: code,
//             output: output,
//             error: error,
//           });
//         });
//       });

//       return result;
//     }
//   } catch (err) {
//     throw err;
//   } finally {
//     // Clean up files in the finally block
//     if (sourceFilePath) {
//       safeDeleteFile(sourceFilePath);
//     }
//     if (outputFilePath) {
//       safeDeleteFile(outputFilePath);
//     }
//   }
// };

// // Route for Python
// app.post("/api/run-python", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     const result = await executeCode(
//       "python",
//       [],
//       code,
//       ".py",
//       false  // Python doesn't need compilation
//     );
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       error: "Execution error",
//       details: err.message,
//     });
//   }
// });

// // Route for JavaScript
// app.post("/api/run-javascript", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     const result = await executeCode(
//       "node",
//       [],
//       code,
//       ".js",
//       false  // JavaScript doesn't need compilation
//     );
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       error: "Execution error",
//       details: err.message,
//     });
//   }
// });

// // Route for C
// app.post("/api/run-c", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     const result = await executeCode(null, [], code, ".c", true, "gcc", []);
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       error: "Compilation error",
//       details: err.message,
//     });
//   }
// });

// // Route for C++
// app.post("/api/run-cpp", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     const result = await executeCode(null, [], code, ".cpp", true, "g++", [
//       "-std=c++11",
//     ]);
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       error: "Compilation error",
//       details: err.message,
//     });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

// //////////////////////////////////////////////////////////////////////////////////////
// const express = require("express");
// const { spawn } = require("child_process");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");

// const app = express();
// const port = 5000;

// // Create temp directory at server startup
// const tempDir = path.join(__dirname, "temp");
// if (!fs.existsSync(tempDir)) {
//   try {
//     fs.mkdirSync(tempDir, { recursive: true });
//     console.log("Temp directory created successfully");
//   } catch (error) {
//     console.error("Error creating temp directory:", error);
//   }
// }

// app.use(cors());
// app.use(express.json());

// // Helper function to safely delete a file
// const safeDeleteFile = (filePath) => {
//   try {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//       console.log(`Successfully deleted file: ${filePath}`);
//     }
//   } catch (error) {
//     console.error(`Error deleting file ${filePath}:`, error);
//   }
// };

// // Helper function to execute code with compilation if needed
// const executeCode = async (
//   command,
//   args,
//   code,
//   extension,
//   needsCompilation = false,
//   compileCommand = null,
//   compileArgs = []
// ) => {
//   let sourceFilePath = null;
//   let outputFilePath = null;

//   try {
//     // Ensure temp directory exists
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }

//     // Create source file with absolute path
//     const fileName = `temp_${Date.now()}${extension}`;
//     sourceFilePath = path.join(tempDir, fileName);

//     // Write code to file with proper encoding
//     fs.writeFileSync(sourceFilePath, code, "utf8");
//     console.log(`Source file created: ${sourceFilePath}`);

//     if (needsCompilation) {
//       // For compiled languages (C, C++, Java)
//       outputFilePath = path.join(tempDir, `output_${Date.now()}.exe`);

//       const fullCompileArgs = [
//         ...compileArgs,
//         sourceFilePath,
//         "-o",
//         outputFilePath,
//       ];
//       console.log(
//         `Compiling with command: ${compileCommand} ${fullCompileArgs.join(" ")}`
//       );

//       // Compile the code
//       const compiler = spawn(compileCommand, fullCompileArgs);
//       let compileError = "";

//       await new Promise((resolve, reject) => {
//         compiler.stderr.on("data", (data) => {
//           compileError += data.toString();
//         });

//         compiler.on("close", (code) => {
//           if (code !== 0) {
//             reject(new Error(compileError));
//           }
//           resolve();
//         });

//         compiler.on("error", (err) => {
//           reject(new Error(`Failed to start compiler: ${err.message}`));
//         });
//       });

//       // Execute the compiled program
//       const process = spawn(outputFilePath);
//       let output = "";
//       let error = "";

//       process.stdout.on("data", (data) => {
//         output += data.toString();
//       });

//       process.stderr.on("data", (data) => {
//         error += data.toString();
//       });

//       return await new Promise((resolve) => {
//         process.on("close", (code) => {
//           resolve({
//             status: code,
//             output: output,
//             error: error,
//           });
//         });
//       });
//     } else {
//       // For interpreted languages (Python, JavaScript)
//       console.log(`Executing with command: ${command} ${sourceFilePath}`);

//       const process = spawn(command, [...args, sourceFilePath], {
//         cwd: tempDir, // Set working directory to temp folder
//       });

//       let output = "";
//       let error = "";

//       process.stdout.on("data", (data) => {
//         output += data.toString();
//       });

//       process.stderr.on("data", (data) => {
//         error += data.toString();
//       });

//       return await new Promise((resolve) => {
//         process.on("close", (code) => {
//           resolve({
//             status: code,
//             output: output,
//             error: error,
//           });
//         });

//         process.on("error", (err) => {
//           resolve({
//             status: 1,
//             output: "",
//             error: `Failed to execute: ${err.message}`,
//           });
//         });
//       });
//     }
//   } catch (err) {
//     console.error("Execution error:", err);
//     throw err;
//   } finally {
//     // Clean up files in the finally block
//     if (sourceFilePath) {
//       safeDeleteFile(sourceFilePath);
//     }
//     if (outputFilePath) {
//       safeDeleteFile(outputFilePath);
//     }
//   }
// };

// // Route for Python
// app.post("/api/run-python", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     const result = await executeCode("python", [], code, ".py", false);
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       status: 1,
//       error: err.message || "Execution failed",
//       output: "",
//     });
//   }
// });

// // Route for JavaScript
// app.post("/api/run-javascript", async (req, res) => {
//   const { code } = req.body;
//   if (!code) return res.status(400).json({ error: "No code provided" });

//   try {
//     const result = await executeCode("node", [], code, ".js", false);
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({
//       status: 1,
//       error: err.message || "Execution failed",
//       output: "",
//     });
//   }
// });

// // [Previous C and C++ routes remain the same]

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
//   console.log(`Temp directory path: ${tempDir}`);
// });
///////////////////////////////////////////////////////////////////////////////////////////////////////


// const express = require("express");
// const { spawn } = require("child_process");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");

// const app = express();
// const port = 5000;

// // Create temp directory at server startup
// const tempDir = path.join(__dirname, "temp");
// if (!fs.existsSync(tempDir)) {
//   fs.mkdirSync(tempDir, { recursive: true });
//   console.log("Temp directory created successfully");
// }

// app.use(cors());
// app.use(express.json());

// const safeDeleteFile = (filePath) => {
//   try {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//   } catch (error) {
//     console.error(`Error deleting file ${filePath}:`, error);
//   }
// };

// const executeCode = async (
//   command,
//   args,
//   code,
//   extension,
//   needsCompilation = false,
//   compileCommand = null,
//   compileArgs = []
// ) => {
//   let sourceFilePath = null;
//   let outputFilePath = null;

//   try {
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }

//     const fileName = `temp_${Date.now()}${extension}`;
//     sourceFilePath = path.join(tempDir, fileName);
//     fs.writeFileSync(sourceFilePath, code, "utf8");

//     if (needsCompilation) {
//       outputFilePath = path.join(tempDir, `output_${Date.now()}`);
//       const fullCompileArgs = [
//         ...compileArgs,
//         sourceFilePath,
//         "-o",
//         outputFilePath,
//       ];

//       const compiler = spawn(compileCommand, fullCompileArgs);
//       let compileError = "";

//       await new Promise((resolve, reject) => {
//         compiler.stderr.on("data", (data) => {
//           compileError += data.toString();
//         });
//         compiler.on("close", (code) => {
//           if (code !== 0) {
//             reject(new Error(compileError));
//           }
//           resolve();
//         });
//         compiler.on("error", (err) => {
//           reject(new Error(`Failed to start compiler: ${err.message}`));
//         });
//       });

//       const process = spawn(outputFilePath);
//       let output = "";
//       let error = "";

//       process.stdout.on("data", (data) => {
//         output += data.toString();
//       });

//       process.stderr.on("data", (data) => {
//         error += data.toString();
//       });

//       return await new Promise((resolve) => {
//         process.on("close", (code) => {
//           resolve({ status: code, output, error });
//         });
//       });
//     } else {
//       const process = spawn(command, [...args, sourceFilePath], {
//         cwd: tempDir,
//       });
//       let output = "";
//       let error = "";

//       process.stdout.on("data", (data) => {
//         output += data.toString();
//       });
//       process.stderr.on("data", (data) => {
//         error += data.toString();
//       });

//       return await new Promise((resolve) => {
//         process.on("close", (code) => {
//           resolve({ status: code, output, error });
//         });
//       });
//     }
//   } catch (err) {
//     return { status: 1, output: "", error: err.message };
//   } finally {
//     if (sourceFilePath) safeDeleteFile(sourceFilePath);
//     if (outputFilePath) safeDeleteFile(outputFilePath);
//   }
// };

// // Routes for different languages
// const languages = {
//   python: { command: "python", extension: ".py", needsCompilation: false },
//   javascript: { command: "node", extension: ".js", needsCompilation: false },
//   c: {
//     command: "gcc",
//     extension: ".c",
//     needsCompilation: true,
//     compileCommand: "gcc",
//   },
//   cpp: {
//     command: "g++",
//     extension: ".cpp",
//     needsCompilation: true,
//     compileCommand: "g++",
//   },
//   java: {
//     command: "java",
//     extension: ".java",
//     needsCompilation: true,
//     compileCommand: "javac",
//   },
// };

// Object.keys(languages).forEach((lang) => {
//   app.post(`/api/run-${lang}`, async (req, res) => {
//     const { code } = req.body;
//     if (!code) return res.status(400).json({ error: "No code provided" });

//     try {
//       const langConfig = languages[lang];
//       const result = await executeCode(
//         langConfig.command,
//         [],
//         code,
//         langConfig.extension,
//         langConfig.needsCompilation,
//         langConfig.compileCommand,
//         []
//       );
//       res.json(result);
//     } catch (err) {
//       res.status(500).json({ status: 1, error: err.message, output: "" });
//     }
//   });
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
//   console.log(`Temp directory path: ${tempDir}`);
// });

const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 5000;

// Create temp directory at server startup
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log("Temp directory created successfully");
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

const executeCode = async (
  command,
  args,
  code,
  extension,
  needsCompilation = false,
  compileCommand = null,
  compileArgs = []
) => {
  let sourceFilePath = null;
  let outputFilePath = null;
  let className = "Main"; // Default Java class name

  try {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    if (extension === ".java") {
      // Enforce "Main.java" for Java execution
      sourceFilePath = path.join(tempDir, `${className}.java`);
    } else {
      sourceFilePath = path.join(tempDir, `temp_${Date.now()}${extension}`);
    }

    fs.writeFileSync(sourceFilePath, code, "utf8");

    if (needsCompilation) {
      if (extension === ".java") {
        // Java Compilation (No -o flag)
        const compiler = spawn("javac", [sourceFilePath]);
        let compileError = "";

        await new Promise((resolve, reject) => {
          compiler.stderr.on("data", (data) => {
            compileError += data.toString();
          });
          compiler.on("close", (code) => {
            if (code !== 0) {
              reject(new Error(compileError));
            }
            resolve();
          });
        });

        // Java Execution
        const process = spawn("java", ["-cp", tempDir, className]);
        let output = "";
        let error = "";

        process.stdout.on("data", (data) => {
          output += data.toString();
        });
        process.stderr.on("data", (data) => {
          error += data.toString();
        });

        return await new Promise((resolve) => {
          process.on("close", (code) => {
            resolve({ status: code, output, error });
          });
        });
      } else {
        // C / C++ Compilation
        outputFilePath = path.join(tempDir, `output_${Date.now()}`);
        const fullCompileArgs = [
          ...compileArgs,
          sourceFilePath,
          "-o",
          outputFilePath,
        ];

        const compiler = spawn(compileCommand, fullCompileArgs);
        let compileError = "";

        await new Promise((resolve, reject) => {
          compiler.stderr.on("data", (data) => {
            compileError += data.toString();
          });
          compiler.on("close", (code) => {
            if (code !== 0) {
              reject(new Error(compileError));
            }
            resolve();
          });
        });

        // Execute compiled C/C++ program
        const process = spawn(outputFilePath);
        let output = "";
        let error = "";

        process.stdout.on("data", (data) => {
          output += data.toString();
        });
        process.stderr.on("data", (data) => {
          error += data.toString();
        });

        return await new Promise((resolve) => {
          process.on("close", (code) => {
            resolve({ status: code, output, error });
          });
        });
      }
    } else {
      // Python & JavaScript Execution
      const process = spawn(command, [...args, sourceFilePath], {
        cwd: tempDir,
      });
      let output = "";
      let error = "";

      process.stdout.on("data", (data) => {
        output += data.toString();
      });
      process.stderr.on("data", (data) => {
        error += data.toString();
      });

      return await new Promise((resolve) => {
        process.on("close", (code) => {
          resolve({ status: code, output, error });
        });
      });
    }
  } catch (err) {
    return { status: 1, output: "", error: err.message };
  } finally {
    if (sourceFilePath) safeDeleteFile(sourceFilePath);
    if (outputFilePath) safeDeleteFile(outputFilePath);
  }
};

// Routes for different languages
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

Object.keys(languages).forEach((lang) => {
  app.post(`/api/run-${lang}`, async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "No code provided" });

    try {
      const langConfig = languages[lang];
      const result = await executeCode(
        langConfig.command,
        [],
        code,
        langConfig.extension,
        langConfig.needsCompilation,
        langConfig.compileCommand,
        []
      );
      res.json(result);
    } catch (err) {
      res.status(500).json({ status: 1, error: err.message, output: "" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Temp directory path: ${tempDir}`);
});

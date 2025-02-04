# CompileHub

🚀 CompileHub – Your All-in-One Online Compiler! 💻⚡

Write, compile, and run C, C++, Java, Python, and JavaScript effortlessly! Built with React.js, Node.js, Express.js, and MongoDB, CompileHub offers blazing-fast execution, real-time error handling, and a sleek, intuitive UI.

🔹 Code. Compile. Run. Repeat. 🚀

## Features

- Supports multiple programming languages (**C, C++, Java, Python, JavaScript**).
- Interactive and user-friendly code editor.
- Real-time compilation and execution.
- Displays output, errors, and execution time instantly.
- Secure and scalable backend using **Node.js & Express.js**.
- Database integration with **MongoDB** for session management.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or later)
- [MongoDB](https://www.mongodb.com/)
- Compiler dependencies for C, C++, Java, Python (Ensure you have them installed on your system).

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Pushkaraj-Palli/Compile-Hub.git
   ```

2. Navigate to the project directory:

   ```bash
   cd CompileHub
   ```

3. Install dependencies for both frontend and backend:

   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

4. Start the backend server:

   ```bash
   node server.js
   ```

5. Return to the client directory and start the frontend:

   ```bash
   cd ../client
   npm run dev
   ```

## Usage

1. Open **CompileHub** in your browser.
2. Select your preferred programming language.
3. Write your code in the editor.
4. Click **Run** to execute and view results instantly.

## Project Structure

```
CompileHub
├── client
│   ├── node_modules
│   ├── public
│   └── src
│       ├── assets
│       ├── Components
│       │   ├── LangList
│       │   │   ├── LangList.css
│       │   │   └── LangList.jsx
│       │   └── Main
│       │       ├── Main.css
│       │       └── Main.jsx
│       ├── context
│       │   └── LanguageContext.jsx
│       ├── App.jsx
│       └── main.jsx
│
└── server
    ├── node_modules
    ├── temp
    ├── package-lock.json
    ├── package.json
    └── server.js


```

## Screenshots

### Code Editor Interface

![Image](https://github.com/user-attachments/assets/00ed004b-1c29-4983-b776-f12ad36165f4)

![Image](https://github.com/user-attachments/assets/8053e016-41ea-4a46-95ae-64db4cefbe66)

## Technologies Used

- **React.js**: For the frontend user interface.
- **Express.js & Node.js**: For handling backend requests.
- **MongoDB**: For storing files and retriving whenever you want.

---

🚀 **Compile your code instantly with CompileHub!** 🚀

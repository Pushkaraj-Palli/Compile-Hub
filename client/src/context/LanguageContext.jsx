// src/context/LanguageContext.js
import React, { createContext, useState, useContext } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [fileExtension, setFileExtension] = useState(".py");

  const selectLanguage = (language) => {
    setSelectedLanguage(language);
    switch (language) {
      case "python":
        setFileExtension(".py");
        break;
      case "c":
        setFileExtension(".c");
        break;
      case "cpp":
        setFileExtension(".cpp");
        break;
      case "java":
        setFileExtension(".java");
        break;
      case "javascript":
        setFileExtension(".js");
        break;
      default:
        setFileExtension(".txt");
    }
  };

  return (
    <LanguageContext.Provider
      value={{ selectedLanguage, fileExtension, selectLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);


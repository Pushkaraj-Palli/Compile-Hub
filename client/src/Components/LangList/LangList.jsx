import React from "react";
import "./LangList.css";
import { assets } from "../../assets/assets";
import { useLanguage } from "../../context/LanguageContext";

const LangList = () => {
  const { selectedLanguage, selectLanguage } = useLanguage();

  const handleLanguageSelect = (lang) => {
    selectLanguage(lang);
  };

  return (
    <>
      <div className="container">
        <div className="lang_list">
          <div
            className={`lang_icon ${
              selectedLanguage === "python" ? "selected" : ""
            }`}
          >
            <button onClick={() => handleLanguageSelect("python")}>
              <img src={assets.python_icon} alt="python_icon" />
            </button>
          </div>

          <div
            className={`lang_icon ${
              selectedLanguage === "c" ? "selected" : ""
            }`}
          >
            <button onClick={() => handleLanguageSelect("c")}>
              <img src={assets.cLang_icon} alt="c_icon" />
            </button>
          </div>

          <div
            className={`lang_icon ${
              selectedLanguage === "cpp" ? "selected" : ""
            }`}
          >
            <button onClick={() => handleLanguageSelect("cpp")}>
              <img src={assets.cPlus_icon} alt="c++_icon" />
            </button>
          </div>

          <div
            className={`lang_icon ${
              selectedLanguage === "java" ? "selected" : ""
            }`}
          >
            <button onClick={() => handleLanguageSelect("java")}>
              <img src={assets.java_icon} alt="java_icon" />
            </button>
          </div>

          <div
            className={`lang_icon ${
              selectedLanguage === "javascript" ? "selected" : ""
            }`}
          >
            <button onClick={() => handleLanguageSelect("javascript")}>
              <img src={assets.javaScript_icon} alt="javaScript_icon" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LangList;

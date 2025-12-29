import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { HashRouter } from "react-router-dom";
import "./index.css";
import { ThemeProvider } from './context/ThemeContext.jsx'
import { SchoolProvider } from './context/SchoolContext.jsx'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <SchoolProvider>
          <App />
        </SchoolProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);
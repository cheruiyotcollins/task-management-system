import React from "react";
import ReactDOM from "react-dom/client"; // ✅ Correct import for React 19
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        {" "}
        {/* Ensure BrowserRouter wraps your App component */}
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

// Performance monitoring
reportWebVitals();

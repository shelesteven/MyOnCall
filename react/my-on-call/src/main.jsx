// React
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Router
import { BrowserRouter, Routes, Route } from "react-router";

// Pages
import Index from "./pages";

// Styles
import "./app.css";

// Create app
const root = document.getElementById("root");
createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

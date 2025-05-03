// React
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Router
import { BrowserRouter, Routes, Route } from "react-router";

// Pages
import Index from "./pages";
import SignIn from "./pages/auth/sign-in";
import SignUp from "./pages/auth/sign-up";
import AdminSignUp from "./pages/auth/admin/sign-up";

// Mantine
import { MantineProvider } from "@mantine/core";

// Styles
import "@mantine/core/styles.css";
import "./app.css";

// Create app
const root = document.getElementById("root");
createRoot(root).render(
  <StrictMode>
    <MantineProvider forceColorScheme="light">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/sign-in" element={<SignIn />} />
          <Route path="/auth/sign-up" element={<SignUp />} />
          <Route path="/auth/admin/sign-up" element={<AdminSignUp />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>
);

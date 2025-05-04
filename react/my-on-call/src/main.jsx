// React
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Router
import { createBrowserRouter, RouterProvider } from "react-router";

// Pages
import Index from "./pages";
import SignIn from "./pages/auth/sign-in";
import SignUp from "./pages/auth/sign-up";
import Schedules from "./pages/schedules";
import AdminSignUp from "./pages/auth/admin/sign-up";
import AdminHolidays from "./pages/admin/holidays";
import AdminSchedules from "./pages/admin/schedules";

// Mantine
import { MantineProvider, createTheme } from "@mantine/core";

// Styles
import "@mantine/core/styles.css";
import "./app.css";

// Create custom theme
const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily: "Inter, sans-serif",
  headings: { fontFamily: "Inter, sans-serif" },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});

// Create router
const router = createBrowserRouter([
  { path: "/", element: <Index /> },
  { path: "/auth/sign-in", element: <SignIn /> },
  { path: "/auth/sign-up", element: <SignUp /> },
  { path: "/auth/admin/sign-up", element: <AdminSignUp /> },
  { path: "/schedules", element: <Schedules /> },
  { path: "/admin/holidays", element: <AdminHolidays /> },
  { path: "/admin/schedules", element: <AdminSchedules /> },
]);

// Create app
const root = document.getElementById("root");
createRoot(root).render(
  <StrictMode>
    <MantineProvider theme={theme} forceColorScheme="light">
      <RouterProvider router={router} />
    </MantineProvider>
  </StrictMode>
);

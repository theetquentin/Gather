import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Login from "./pages/Login";
import "./styles/style.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Login />
  </StrictMode>,
);

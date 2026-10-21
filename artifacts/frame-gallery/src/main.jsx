import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import App from "./App.jsx";
import { cognitoAuthConfig } from "./authConfig";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider {...cognitoAuthConfig}>
    <App />
  </AuthProvider>,
);

import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import App from "./App.jsx";
import { cognitoAuthConfig } from "./authConfig";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider
    {...cognitoAuthConfig}
    onSigninCallback={() => {
      const url = new URL(window.location.href);
      [
        "code",
        "state",
        "session_state",
        "iss",
        "error",
        "error_description",
        "error_uri",
      ].forEach((parameter) => url.searchParams.delete(parameter));
      window.history.replaceState(
        {},
        document.title,
        `${url.pathname}${url.search}${url.hash}`,
      );
    }}
  >
    <App />
  </AuthProvider>,
);

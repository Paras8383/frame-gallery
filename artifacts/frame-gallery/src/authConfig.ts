import { WebStorageStateStore } from "oidc-client-ts";

export const cognitoHostedUiDomain =
  "https://us-east-1kcysvpg6q.auth.us-east-1.amazoncognito.com";

export const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_KCYSVpG6q",
  client_id: "6v3pfeu0h6o1opu7cddfkk7nod",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid email profile",
  post_logout_redirect_uri: window.location.origin,
  userStore: new WebStorageStateStore({
    store: window.sessionStorage,
  }),
};

export function buildCognitoLogoutUrl(origin = window.location.origin) {
  const logoutUrl = new URL("/logout", cognitoHostedUiDomain);
  logoutUrl.searchParams.set("client_id", cognitoAuthConfig.client_id);
  logoutUrl.searchParams.set("logout_uri", origin);
  return logoutUrl.toString();
}

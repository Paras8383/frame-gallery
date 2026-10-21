import { WebStorageStateStore } from "oidc-client-ts";

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

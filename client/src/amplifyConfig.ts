import { getCognitoConfig } from "../config";

interface AmplifyAuthConfig {
  Auth: {
    Cognito: {
      userPoolId: string;
      userPoolClientId: string;
      region: string;
    };
    oauth?: {
      domain: string;
      scope: string[];
      redirectSignIn: string[];
      redirectSignOut: string[];
      responseType: string;
    };
  };
}

export const getAmplifyConfig = (): AmplifyAuthConfig => {
  const {
    userPoolId,
    userPoolClientId,
    region,
    domain,
    scope,
    redirectSignIn,
    redirectSignOut,
    responseType,
  } = getCognitoConfig();

  return {
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        region,
      },
      oauth: {
        domain,
        scope: scope ?? ["email", "openid", "profile"],
        redirectSignIn: redirectSignIn?.split(",") ?? ["http://localhost:5173"],
        redirectSignOut: redirectSignOut?.split(",") ?? [
          "http://localhost:5173",
        ],
        responseType: responseType || "code",
      },
    },
  };
};

import { getApps, initializeApp } from "firebase/app";
import { browserSessionPersistence, getAuth, initializeAuth, type Auth } from "firebase/auth";

export const officialOrigin = "https://www.cr7botai.com";
const name = "smart-gulf-funds-registration";
const config = {
  apiKey: process.env.NEXT_PUBLIC_SGF_FIREBASE_API_KEY?.trim() || "AIzaSyAjvTzEBmejj6AoOWx3qQAHQ2ITmdj1meU",
  projectId: process.env.NEXT_PUBLIC_SGF_FIREBASE_PROJECT_ID?.trim() || "smart-gulf-funds",
  appId: process.env.NEXT_PUBLIC_SGF_FIREBASE_APP_ID?.trim() || "1:677177948074:web:f4635a3e251ab4f7f8ddd3",
};
const telegramHandle = (process.env.NEXT_PUBLIC_SGF_PRIVACY_TELEGRAM?.trim() || "Khaled_AlAlya")
  .replace(/^(?:https:\/\/)?t\.me\//i, "").replace(/^@|\/$/g, "");
const hasPrivacyContact = /^[a-zA-Z0-9_]{3,32}$/.test(telegramHandle);
// The homepage link stays controlled by its separate visibility flag during testing.
export const enabled = (process.env.NEXT_PUBLIC_SGF_SIGNUP_ENABLED ?? "1") === "1" &&
  /^AIza[A-Za-z0-9_-]{35}$/.test(config.apiKey) && /^1:\d+:web:[a-f0-9]+$/i.test(config.appId) &&
  /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(config.projectId) &&
  config.projectId !== "cr7bot-85133" && hasPrivacyContact;
let sharedAuth: Auth | undefined;

export function authForSite() {
  if (!enabled || window.location.origin !== officialOrigin) throw Error("registration disabled");
  if (!sharedAuth) {
    const existing = getApps().find((app) => app.name === name);
    sharedAuth = existing
      ? getAuth(existing)
      : initializeAuth(initializeApp({ ...config, authDomain: config.projectId + ".firebaseapp.com" }, name), {
          persistence: browserSessionPersistence,
        });
  }
  return sharedAuth;
}

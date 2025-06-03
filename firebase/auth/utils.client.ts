// src/firebase/auth/utils.client.ts
import firebase, { auth } from "../clientApp";
import nookies from "nookies";
import { isEmailAllowed } from "./isEmailAllowed";
import {DEFAULT_ROLES, ensureUserDoc, linkGoogleWithEmail} from "../user/useUser";
import {getUserProvidersFromFirestore} from "../user/getProvidersByEmail";

export const signInWithEmail = async (
    email: string,
    password: string
): Promise<firebase.auth.UserCredential> => {
  const userCred = await auth.signInWithEmailAndPassword(email, password);
  const token = await userCred.user!.getIdToken();
  nookies.set(undefined, "token", token, { path: "/" });
  return userCred;
};

// ---------- SIGN-UP ---------- //
  export const signUpWithEmail = async (
      email: string,
      password: string
  ): Promise<firebase.auth.UserCredential> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!(await isEmailAllowed(normalizedEmail))) {
      throw { code: "auth/not-allowed", message: "Correo no autorizado." };
    }

    // 1) Verificar si ya existe el usuario por Firestore
    const existingProviders = await getUserProvidersFromFirestore(normalizedEmail);

    // 2) Si ya existe con Google pero no con password, se loguea con Google y se linkea
    if (existingProviders.includes("google.com") && !existingProviders.includes("password")) {
      const googleCred = await signInWithGoogle(); // usa tu signIn actual
      await linkGoogleWithEmail(normalizedEmail, password); // vincula password automáticamente
      return googleCred;
    }

    // 3) Registro normal con email/password
    const userCred = await auth.createUserWithEmailAndPassword(normalizedEmail, password);
    await userCred.user?.getIdToken(true);

    const token = await userCred.user!.getIdToken();
    nookies.set(undefined, "token", token, { path: "/" });

    await ensureUserDoc(
        userCred.user!.uid,
        normalizedEmail,
        ["password"],
        DEFAULT_ROLES
    );

    return userCred;
  };


// ---------- GOOGLE ---------- //
export const signInWithGoogle = async (emailInput?: string): Promise<firebase.auth.UserCredential> => {
  if (!emailInput) {
    throw { code: "auth/missing-email", message: "Debes proporcionar un correo para continuar con Google." };
  }

  const email = emailInput.trim().toLowerCase();

  const allowed = await isEmailAllowed(email);
  if (!allowed) {
    throw { code: "auth/not-allowed", message: "Correo no autorizado para autenticación con Google." };
  }

  const existingProviders = await getUserProvidersFromFirestore(email);

  // Caso: cuenta ya registrada con password y no tiene google → verificar si está logueado
  if (existingProviders.includes("password") && !existingProviders.includes("google.com")) {
    const currentUser = auth.currentUser;
    const isLoggedInWithPassword =
        currentUser?.email === email &&
        currentUser?.providerData.some((p): p is firebase.UserInfo => p?.providerId === "password");

    if (!isLoggedInWithPassword) {
      throw {
        code: "auth/link-required",
        message: "Este correo ya está registrado con contraseña. Inicia sesión con tu contraseña y luego vincula Google desde ajustes.",
      };
    }
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await auth.signInWithPopup(provider);
  const user = result.user!;

  const providersList = user.providerData
      .filter((p): p is firebase.UserInfo => p != null)
      .map((p) => p.providerId);

  await ensureUserDoc(user.uid, email, providersList, DEFAULT_ROLES);

  const token = await user.getIdToken();
  nookies.set(undefined, "token", token, { path: "/" });

  return result;
};



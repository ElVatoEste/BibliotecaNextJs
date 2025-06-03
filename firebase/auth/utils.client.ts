// src/utils/auth.ts
import firebase, { auth, db } from "../clientApp";
import nookies from "nookies";
import { isEmailAllowed } from "./isEmailAllowed";
import {User} from "../models/User";

const DEFAULT_ROLES = ["base"];

/** Guarda (o actualiza) el documento del usuario con su lista de roles */
const ensureUserDoc = async (
    uid: string,
    email: string,
    roles: string[] = DEFAULT_ROLES
): Promise<void> => {
  const ref = db.collection("users").doc(uid);

  try {
    const snap = await ref.get();
    if (snap.exists) {
      console.log("[Firestore] Usuario ya existe:", uid);
      return;
    }

    // 1) Verificar si hay al menos un documento en "users"
    const anyUser = await db.collection("users").limit(1).get();
    // Si no existe ningún usuario, este será el primero
    const isFirstUser = anyUser.empty;

    // 2) Si es el primer usuario, forzar rol = ["admin"]
    const assignedRoles = isFirstUser ? ["admin", "base"] : roles;

    const newUser: Omit<User, "id"> = {
      email,
      roles: assignedRoles,
      createdAt: firebase.firestore.FieldValue.serverTimestamp() as any,
    };

    console.log("[Firestore] Creando documento para:", uid, newUser);
    await ref.set(newUser);
    console.log("[Firestore] Documento creado correctamente.");
  } catch (error: any) {
    console.error("[Firestore] Error al crear documento:", {
      code: error.code,
      message: error.message,
      details: error,
    });
    throw error;
  }
};


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
  console.log("[signUp] Verificando si correo está permitido:", email);
  if (!(await isEmailAllowed(email))) {
    console.log("[signUp] Correo bloqueado por isEmailAllowed.");
    throw { code: "auth/not-allowed", message: "Correo no autorizado." };
  }
  console.log("[signUp] Correo permitido.");

  try {
    // Intentamos crear la cuenta normalmente
    const userCred = await auth.createUserWithEmailAndPassword(email, password);
    await userCred.user?.getIdToken(true);
    console.log("[signUp] Usuario creado en Auth:", userCred.user?.uid);

    // Esperamos un momento para que Firebase propague el estado
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Creamos el documento en Firestore
    await ensureUserDoc(userCred.user!.uid, email, DEFAULT_ROLES);

    const token = await userCred.user!.getIdToken();
    nookies.set(undefined, "token", token, { path: "/" });
    return userCred;
  } catch (error: any) {
    // Si el correo ya existe
    if (error.code === "auth/email-already-in-use") {
      // Averiguamos con qué proveedores está registrado ese email
      const methods = await auth.fetchSignInMethodsForEmail(email);

      console.log("[signUp] metodos registrados de la cuenta:", methods);

      // Si ya existe con Google, invitamos al usuario a iniciar sesión con Google y luego vinculamos la credencial
      if (methods.includes("google.com") || methods.length === 0) {
        throw {
          code: "needs-account-link",
          message:
              "Este correo ya se registró con Google. Inicia sesión con Google y luego podrás asignar una contraseña.",
        };
      }
    }
    // Otros errores, relanzamos
    console.error("[signUp] Error al crear usuario:", error);
    throw error;
  }
};

// ---------- GOOGLE ---------- //
export const signInWithGoogle = async (): Promise<firebase.auth.UserCredential> => {
  const provider = new firebase.auth.GoogleAuthProvider();
  const userCred = await auth.signInWithPopup(provider);
  const email = userCred.user!.email!;

  if (!(await isEmailAllowed(email))) {
    await auth.signOut();
    throw { code: "auth/not-allowed", message: "Correo de Google no autorizado." };
  }

  // Solo creamos el doc si no existe
  await ensureUserDoc(userCred.user!.uid, email, DEFAULT_ROLES);

  const token = await userCred.user!.getIdToken();
  nookies.set(undefined, "token", token, { path: "/" });
  return userCred;
};

// ---------- Ligar (link) la cuenta Google con correo+contraseña ---------- //
export const linkGoogleWithEmail = async (
    email: string,
    password: string
): Promise<void> => {
  console.log("[link] Verificando si correo está permitido:", email);

  if (!(await isEmailAllowed(email))) {
    console.log("[link] Correo bloqueado por isEmailAllowed.");
    throw { code: "auth/not-allowed", message: "Correo no autorizado." };
  }
  console.log("[link] Correo permitido.");

  const currentUser = firebase.auth().currentUser;

  if (!currentUser || !currentUser.email || currentUser.email !== email) {
    throw {
      code: "auth/session-mismatch",
      message: "Inicia sesión con Google antes de vincular la contraseña.",
    };
  }

  const emailCredential = firebase.auth.EmailAuthProvider.credential(email, password);

  try {
    await currentUser.linkWithCredential(emailCredential);
    console.log("[link] Cuenta Google vinculada con correo y contraseña.");
  } catch (error: any) {
    if (error.code === "auth/credential-already-in-use") {
      console.warn("[link] Ya estaba vinculada con esta credencial.");
    } else {
      console.error("[link] Error al vincular:", error);
      throw error;
    }
  }

  await ensureUserDoc(currentUser.uid, email, DEFAULT_ROLES);

  const token = await currentUser.getIdToken(true);
  nookies.set(undefined, "token", token, { path: "/" });
};



// Recuperar contraseña
export const resetPassword = async (email: string): Promise<void> => {
  await firebase.auth().sendPasswordResetEmail(email);
};

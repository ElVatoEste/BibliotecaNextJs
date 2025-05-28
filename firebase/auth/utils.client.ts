import firebase from "../clientApp";
import firebaseAdmin from "../adminApp";
import nookies from "nookies";

export const signInWithEmail = async (
    email: string,
    password: string
): Promise<firebase.auth.UserCredential> => {
  const userCred = await firebase.auth().signInWithEmailAndPassword(
      email,
      password
  );
  const token = await userCred.user!.getIdToken();
  nookies.set(undefined, "token", token, { path: "/" });
  return userCred;
};


export const signUpWithEmail = async (
    email: string,
    password: string
): Promise<firebase.auth.UserCredential> => {
  const userCred = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
  const token = await userCred.user!.getIdToken();
  nookies.set(undefined, "token", token, { path: "/" });
  return userCred;
};

export const signInWithGoogle = async (): Promise<
    firebase.auth.UserCredential
> => {
  const provider = new firebase.auth.GoogleAuthProvider();
  const userCred = await firebase.auth().signInWithPopup(provider);
  const token = await userCred.user!.getIdToken();
  nookies.set(undefined, "token", token, { path: "/" });
  return userCred;
};

// Recuperar contraseña: envía email de reset.
export const resetPassword = async (email: string): Promise<void> => {
  await firebase.auth().sendPasswordResetEmail(email);
};

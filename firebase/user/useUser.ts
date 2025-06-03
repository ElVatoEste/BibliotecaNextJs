import firebase, {db} from "../clientApp";
import nookies from "nookies";
import {User} from "../models/User";
import {isEmailAllowed} from "../auth/isEmailAllowed";

export const DEFAULT_ROLES = ["base"];

/** Guarda (o actualiza) el documento del usuario con su lista de roles */
export const ensureUserDoc = async (
    uid: string,
    email: string,
    providers: string[],
    roles: string[] = DEFAULT_ROLES
): Promise<void> => {
    const ref = db.collection("users").doc(uid);

    try {
        const snap = await ref.get();
        if (snap.exists) {

            // 1) Si ya existe, agregar nuevos providers sin duplicar:
            await ref.update({
                providers: firebase.firestore.FieldValue.arrayUnion(...providers),
            });

            return;
        }

        // 2) Si no existe, determinar si es el primer usuario:
        const anyUser = await db.collection("users").limit(1).get();
        const isFirstUser = anyUser.empty;

        // 3) Asignar roles (el primero siempre admin+base):
        const assignedRoles = isFirstUser ? ["admin", "base"] : roles;

        // 4) Construir objeto newUser incluyendo providers:
        const newUser: Omit<User, "id"> = {
            email,
            roles: assignedRoles,
            providers,                                  // <-- Guardar la lista inicial
            createdAt: firebase.firestore.FieldValue.serverTimestamp() as any,
        };
        await ref.set(newUser);
    } catch (error: any) {
        console.error("[Firestore] Error al crear/actualizar documento:", {
            code: error.code,
            message: error.message,
            details: error,
        });
        throw error;
    }
};


// Recuperar contraseña
export const resetPassword = async (email: string): Promise<void> => {
    await firebase.auth().sendPasswordResetEmail(email);
};

/**
 * Cambia la contraseña del usuario autenticado con email/password.
 */
export const changePassword = async (
    currentPassword: string,
    newPassword: string
): Promise<void> => {
    const user = firebase.auth().currentUser;

    if (!user || !user.email) {
        throw { code: "auth/no-current-user", message: "No hay usuario autenticado." };
    }

    // 1) Reautenticamos con la contraseña actual
    const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
    );

    try {
        await user.reauthenticateWithCredential(credential);
    } catch (err: any) {
        // Si la contraseña actual está mal o hay otro problema de reautenticación
        if (err.code === "auth/wrong-password") {
            throw { code: "auth/wrong-password", message: "Contraseña actual incorrecta." };
        }
        throw err;
    }

    // 2) Actualizamos a la nueva contraseña
    try {
        await user.updatePassword(newPassword);
        // (Opcional) Forzar refresco de token
        const token = await user.getIdToken(true);
        nookies.set(undefined, "token", token, { path: "/" });
    } catch (err: any) {
        // Ejemplo: contraseña muy débil
        if (err.code === "auth/weak-password") {
            throw { code: "auth/weak-password", message: "La nueva contraseña es muy débil." };
        }
        throw err;
    }
};

// ---------- Ligar (link) la cuenta Google con correo+contraseña ---------- //
export const linkGoogleWithEmail = async (
    email: string,
    password: string
): Promise<void> => {

    if (!(await isEmailAllowed(email))) {
        throw { code: "auth/not-allowed", message: "Correo no autorizado." };
    }

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
    } catch (error: any) {
        if (error.code === "auth/credential-already-in-use") {
            console.warn("[link] Ya estaba vinculada con esta credencial.");
        } else {
            console.error("[link] Error al vincular:", error);
            throw error;
        }
    }

    await ensureUserDoc(
        currentUser.uid,
        email,
        currentUser.providerData.map(pd => pd?.providerId).filter(Boolean) as string[],
        DEFAULT_ROLES
    );


    const token = await currentUser.getIdToken(true);
    nookies.set(undefined, "token", token, { path: "/" });
};

/**
 * Vincula la cuenta actual (autenticada con email/password) con Google.
 * El usuario debe estar logueado con email/password antes de llamar a este método.
 */
export const linkEmailWithGoogle = async (): Promise<void> => {
    const currentUser = firebase.auth().currentUser;

    if (!currentUser || !currentUser.email) {
        throw { code: "auth/no-current-user", message: "No hay usuario autenticado." };
    }

    const provider = new firebase.auth.GoogleAuthProvider();

    try {
        await currentUser.linkWithPopup(provider);
    } catch (err: any) {
        if (err.code === "auth/credential-already-in-use") {
            throw {
                code: "auth/credential-already-in-use",
                message: "Esta cuenta de Google ya está vinculada a otro usuario.",
            };
        }
        throw err;
    }

    // Obtener todos los providers actuales
    const providers = currentUser.providerData.map(pd => pd?.providerId).filter(Boolean) as string[];

    // Actualizar Firestore
    await ensureUserDoc(currentUser.uid, currentUser.email, providers, DEFAULT_ROLES);

    const token = await currentUser.getIdToken(true);
    nookies.set(undefined, "token", token, { path: "/" });
};


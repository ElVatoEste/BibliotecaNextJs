import {db} from "../clientApp";

const REQUIRED_DOMAIN = "uamv.edu.ni";

export const isEmailAllowed = async (email: string): Promise<boolean> => {
    const normalized = email.trim().toLowerCase();
    const [, domain] = normalized.split("@");

    // 1) Dominio obligatorio
    if (domain !== REQUIRED_DOMAIN) return false;

    // 2) Lista blanca opcional
    const snap = await db
        .collection("allowedEmails")
        .where("email", "==", normalized)
        .limit(1)
        .get();

    // Si la colección está vacía → permitir cualquiera del dominio
    // Si tiene elementos → solo permitir si el correo está
    return snap.size === 0 || !snap.empty;
};

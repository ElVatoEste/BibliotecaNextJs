import { db } from "../clientApp";

export const getUserProvidersFromFirestore = async (email: string): Promise<string[]> => {
    const snap = await db
        .collection("users")
        .where("email", "==", email.trim().toLowerCase())
        .limit(1)
        .get();

    if (snap.empty) return [];
    const data = snap.docs[0].data();
    return Array.isArray(data.providers) ? data.providers : [];
};

// src/utils/useAuthProviders.ts
import { useEffect, useState } from "react";
import nookies from "nookies";

export const useAuthProviders = (): string[] => {
    const [providers, setProviders] = useState<string[]>([]);

    useEffect(() => {
        const cookies = nookies.get();
        const token = cookies.token;

        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const identities = payload.firebase?.identities || {};
            setProviders(Object.keys(identities));
        } catch (err) {
            console.error("[useAuthProviders] Error al decodificar el token:", err);
        }
    }, []);

    return providers;
};

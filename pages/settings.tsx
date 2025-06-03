import React, { useState } from "react";
import Shell from "../components/shell";
import { GetServerSidePropsContext } from "next";
import nookies from "nookies";
import { linkGoogleWithEmail } from "../firebase/auth/utils.client";
import firebase from "../firebase/clientApp";

export default function Settings() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleLinkAccount = async () => {
    const user = firebase.auth().currentUser;

    if (!user?.email) {
      setError("No se encontró el correo del usuario actual.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      await linkGoogleWithEmail(user.email, password);
      setStatus("success");
    } catch (err: any) {
      console.error("Error al vincular:", err);
      setError(err.message || "Error desconocido.");
      setStatus("error");
    }
  };

  return (
      <Shell>
        <div className="max-w-md mx-auto p-4 space-y-4">
          <h2 className="text-xl font-semibold">Vincular cuenta con contraseña</h2>

          <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-4 py-2 rounded"
          />

          <button
              onClick={handleLinkAccount}
              disabled={!password || status === "loading"}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {status === "loading" ? "Vinculando..." : "Vincular cuenta"}
          </button>

          {status === "success" && (
              <p className="text-green-600">Cuenta vinculada correctamente ✅</p>
          )}
          {status === "error" && (
              <p className="text-red-600">{error}</p>
          )}
        </div>
      </Shell>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { userIsLoggedIn } = await import("../firebase/auth/utils.server");
  const cookies = nookies.get(ctx);
  const authenticated = await userIsLoggedIn(cookies);

  if (!authenticated) {
    ctx.res.writeHead(302, { Location: "/login" });
    ctx.res.end();
  }

  return {
    props: {},
  };
}

import React from "react";
import Shell from "../components/shell";
import Content from "../components/content/Content";
import { GetServerSidePropsContext } from "next";
import nookies from "nookies";
import AttendanceTable from "../components/asistencias/AttendanceTable";


export default function Asistencia() {
  return (
      <Shell>
        <Content title="Gestión de Asistencias">
          <AttendanceTable />
        </Content>
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
    return { props: {} }; // requerido incluso después de redirigir
  }

  return {
    props: {},
  };
}
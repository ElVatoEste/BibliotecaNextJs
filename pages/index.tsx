import React from "react";
import Scheduler from "../components/scheduler";
import Splash from "../components/splash";

import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import nookies from "nookies";

export default function index(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  return (
    <div>
      {!props.authenticated && <Splash />}
      {props.authenticated && <Scheduler />}
    </div>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { userIsLoggedIn } = await import("../firebase/auth/utils.server");
  const cookies = nookies.get(ctx);
  const authenticated = await userIsLoggedIn(cookies);
  return {
    props: { authenticated },
  };
}

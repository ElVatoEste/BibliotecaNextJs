import React from "react";
import firebase from "../firebase/clientApp"
import type { GetServerSidePropsContext } from "next"
import nookies from "nookies"
import Shell from "../components/shell"
import { useAuthProviders } from "../utils/hooks/useAuthProviders"
import { changePassword, linkGoogleWithEmail, linkEmailWithGoogle } from "../firebase/user/useUser"
import Content from "../components/content/Content";
import ProfileSettings from "../components/userConfig/Profile-settings";

export default function Ajustes() {
  const providers = useAuthProviders()
  const user = firebase.auth().currentUser
  const email = user?.email || ""

  const handleLinkGoogle = async () => {
    await linkEmailWithGoogle()
  }

  const handleLinkEmail = async (email: string, password: string) => {
    await linkGoogleWithEmail(email, password)
  }

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    await changePassword(currentPassword, newPassword)
  }

  return (
      <Shell>
        <Content title="Configuraciones">
          <ProfileSettings
              providers={providers}
              userEmail={email}
              onLinkGoogle={handleLinkGoogle}
              onLinkEmail={handleLinkEmail}
              onChangePassword={handleChangePassword}
          />
        </Content>
      </Shell>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { userIsLoggedIn } = await import("../firebase/auth/utils.server")
  const cookies = nookies.get(ctx)
  const authenticated = await userIsLoggedIn(cookies)

  if (!authenticated) {
    ctx.res.writeHead(302, { Location: "/login" })
    ctx.res.end()
  }

  return {
    props: {},
  }
}

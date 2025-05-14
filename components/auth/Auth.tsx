import React from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "../../firebase/clientApp";

// Configure FirebaseUI.
const uiConfig = {
  signInFlow: 'popup',
  signInSuccessUrl: '/', // redirige al home al iniciar sesión
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
};


function SignInScreen() {
  return (
    <div className="relative bg-white px-10 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 mx-auto max-w-lg rounded-md">
      <div className="divide-y divide-indigo-100">
        <div className="pb-2 text-base font-semibold">
          Sign in or create a new account
        </div>
        <div>
          <StyledFirebaseAuth
            uiConfig={uiConfig}
            firebaseAuth={firebase.auth()}
          />
        </div>
      </div>
    </div>
  );
}

export default SignInScreen;

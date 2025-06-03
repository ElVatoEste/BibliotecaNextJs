import firebase from "firebase/app";

export interface User {
    id: string;
    email: string;
    roles: string[];
    providers: string[];
    createdAt: firebase.firestore.Timestamp;
}

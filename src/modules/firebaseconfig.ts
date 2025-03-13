import { FirebaseApp, initializeApp } from "firebase/app";
import { initializeFirestore as firestoreInit } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyARTz6QMZIfWmYn1CM9pIVDZqMGVJHw9cc",
    authDomain: "slutuppgift-databas-js2.firebaseapp.com",
    projectId: "slutuppgift-databas-js2",
    storageBucket: "slutuppgift-databas-js2.firebasestorage.app",
    messagingSenderId: "340617272733",
    appId: "1:340617272733:web:32dffc8d64f0caf068e374"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
});

function initializeFirestore(app: FirebaseApp, settings: { experimentalForceLongPolling: boolean; useFetchStreams: boolean; }) {
    return firestoreInit(app, settings);
}

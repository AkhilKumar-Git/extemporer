        // client/src/lib/firebase.ts
        import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
        import { getFirestore, Firestore } from "firebase/firestore";
        import { getStorage, FirebaseStorage } from "firebase/storage";
        import { getAuth, Auth } from "firebase/auth";

        const firebaseConfig = {
            apiKey: "AIzaSyD2UAL7rTD56TZ4JzmrdIGsVa6Ezz-FwSE",
            authDomain: "extempored.firebaseapp.com",
            projectId: "extempored",
            storageBucket: "extempored.firebasestorage.app",
            messagingSenderId: "97135109512",
            appId: "1:97135109512:web:4a61fbbb540e46757f063d",
            measurementId: "G-KCMZW7E8XF"
          };

        // Initialize Firebase
        let app: FirebaseApp;
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }

        const auth: Auth = getAuth(app);
        const db: Firestore = getFirestore(app);
        const storage: FirebaseStorage = getStorage(app);

        export { app, auth, db, storage };
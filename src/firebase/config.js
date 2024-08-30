// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0QK1SpdH58EdsYCWw6VjBhXmPvMphhBo",
  authDomain: "ct-bug-log.firebaseapp.com",
  projectId: "ct-bug-log",
  storageBucket: "ct-bug-log.appspot.com",
  messagingSenderId: "220369799130",
  appId: "1:220369799130:web:511316c0fed45c379222e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage};
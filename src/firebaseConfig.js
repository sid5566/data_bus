// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyADqd_ZMDTcYtjQtLZTVAX2kTG0Lz42XwI",
  authDomain: "databus-617ac.firebaseapp.com",
  databaseURL: "https://databus-617ac-default-rtdb.firebaseio.com",
  projectId: "databus-617ac",
  storageBucket: "databus-617ac.appspot.com",
  messagingSenderId: "759224872439",
  appId: "1:759224872439:android:06fc5ef750e70a534452f2"
};

const app = initializeApp(firebaseConfig);


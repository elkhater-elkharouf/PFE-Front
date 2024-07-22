importScripts("https://www.gstatic.com/firebasejs/10.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.2.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyATGG8rUabpVGURy9TIRmp4HoGXb6-vY_Q",
  authDomain: "salut-bd86d.firebaseapp.com",
  projectId: "salut-bd86d",
  storageBucket: "salut-bd86d.appspot.com",
  messagingSenderId: "356874574690",
  appId: "1:356874574690:web:8b29f3e358eb9f924a6a3b"
});

const messaging = firebase.messaging();
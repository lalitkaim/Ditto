importScripts('https://www.gstatic.com/firebasejs/7.14.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyDV4A-WLv-QcTqDg25xc_QNlvccfJuA8Lk",
    authDomain: "the-ditto.firebaseapp.com",
    databaseURL: "https://the-ditto.firebaseio.com",
    projectId: "the-ditto",
    storageBucket: "the-ditto.appspot.com",
    messagingSenderId: "129721861533",
    appId: "1:129721861533:web:9c04afd60d73e0f1e8db74",
    measurementId: "G-K4WDBWG1VY"
};

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
    const notificationTitle ="Quiddle";
    const notificationOptions = {
        body: payload.notification.body
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});
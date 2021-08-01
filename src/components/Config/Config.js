import firebase from "firebase";

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

export const initialize=firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

let FCMToken = null

messaging.usePublicVapidKey("BMHKYXOMW6Nw8AFHug_zYgQxy0j-CJjuyZvSgv5JwnRRYCMuOeQi6KfVQTGJWQn5Qjl4OP4IOw8AXKE5_-oD9D4")

messaging.requestPermission()
.then(function(){
})
.catch(function(err){
    console.log(err)
})

messaging.getToken()
.then(function(token){
    FCMToken = token
})
.catch(function(err){
    console.log(err)
})

messaging.onTokenRefresh(()=>{
messaging.getToken()
.then(function(token){
    FCMToken = token
})
.catch(function(err){
    console.log(err)
})
})

firebase.auth().onAuthStateChanged(user=>{
    const db = firebase.firestore();
    if(firebase.auth().currentUser){
        const uid = firebase.auth().currentUser.uid;
        db.collection("users").doc(uid).set({
            token: FCMToken
        }, { merge: true });
    }
})

messaging.onMessage(function(payload){
    if(payload.notification){
        let title = payload.notification.title
        let options ={
            body:payload.notification.body,
            click_action:payload.notification.click_action
        }
        const myNotification = new Notification(title, options)
    }
})
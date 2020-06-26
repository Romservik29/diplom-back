const admin = require('firebase-admin')
const serviceAccount = require('../util/diplomsgk2020.json')


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://diplomsgk2020-ff454.firebaseio.com",
    storageBucket: "diplomsgk2020-ff454.appspot.com" 
});

const auth = admin.auth();

const storage = admin.storage().bucket();
const db = admin.firestore();
module.exports ={admin, db, auth, storage};
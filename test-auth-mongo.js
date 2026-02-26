const admin = require('firebase-admin');
const mongoose = require('mongoose');
const serviceAccount = require('/home/ayuda/Documents/fyp/cityfix-backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function checkAuth() {
    await mongoose.connect('mongodb://localhost:27017/cityfix');
    
    // Attempt to list all valid firebase users
    try {
        const listUsersResult = await admin.auth().listUsers(10);
        console.log("Firebase Auth Users:");
        listUsersResult.users.forEach((userRecord) => {
            console.log(`- ${userRecord.email} (UID: ${userRecord.uid})`);
        });

        // Now compare with mongodb
        const User = mongoose.model('User', new mongoose.Schema({ firebaseUid: String, role: String, email: String }));
        const mUsers = await User.find({});
        console.log("\nMongoDB Users:");
        mUsers.forEach((u) => {
            console.log(`- ${u.email} (UID: ${u.firebaseUid}) [Role: ${u.role}]`);
        });

    } catch (error) {
        console.error("Error connecting to Firebase:", error);
    }
    
    process.exit(0);
}

checkAuth();

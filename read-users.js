const mongoose = require('mongoose');

async function readUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/cityfix');
        const db = mongoose.connection.db;
        
        const users = await db.collection('users').find({}).toArray();
        users.forEach(u => console.log(`- ${u.email} | ${u.role} | ${u.firebaseUid}`));
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

readUsers();

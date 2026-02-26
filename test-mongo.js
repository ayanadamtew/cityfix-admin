const mongoose = require('mongoose');

async function checkUser() {
    await mongoose.connect('mongodb://localhost:27017/cityfix');
    const User = mongoose.model('User', new mongoose.Schema({ firebaseUid: String, role: String, email: String }));
    const users = await User.find({});
    console.log("All users in DB:", users);
    process.exit(0);
}

checkUser();

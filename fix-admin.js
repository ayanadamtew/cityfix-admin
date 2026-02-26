const mongoose = require('mongoose');

async function fix() {
    await mongoose.connect('mongodb://localhost:27017/cityfix');
    const User = mongoose.model('User', new mongoose.Schema({ firebaseUid: String, role: String, email: String, fullName: String, department: String }, { timestamps: true }));
    
    await User.create({
        firebaseUid: 'lGkVwWGU23Y5g4YZ5NGM96DgDf02',
        email: 'admin@cityfix.org',
        fullName: 'System Administrator',
        role: 'SUPER_ADMIN',
        department: null
    });
    
    console.log("Admin user successfully injected into MongoDB!");
    process.exit(0);
}

fix();

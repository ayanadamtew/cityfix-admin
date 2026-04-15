const mongoose = require('mongoose');

async function seedAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/cityfix');
        const db = mongoose.connection.db;
        
        const adminData = {
            firebaseUid: 'lGkVwWGU23Y5g4YZ5NGM96DgDf02',
            email: 'admin@cityfix.org',
            fullName: 'System Administrator',
            role: 'SUPER_ADMIN',
            isDisabled: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('users').insertOne(adminData);
        console.log('Admin user inserted successfully:', result.insertedId);
    } catch (e) {
        if (e.code === 11000) {
            console.log('Admin user already exists (duplicate key error).');
        } else {
            console.error('Error seeding admin user:', e);
        }
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedAdmin();

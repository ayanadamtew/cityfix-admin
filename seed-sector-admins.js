const mongoose = require('mongoose');

async function seedSectorAdmins() {
    try {
        await mongoose.connect('mongodb://localhost:27017/cityfix');
        const db = mongoose.connection.db;
        
        const sectorAdmins = [
            {
                firebaseUid: 'water-admin-uid-placeholder',
                email: 'water-admin@cityfix.org',
                fullName: 'Water Department Admin',
                role: 'SECTOR_ADMIN',
                department: 'Water',
                isDisabled: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firebaseUid: 'waste-admin-uid-placeholder',
                email: 'waste-admin@cityfix.org',
                fullName: 'Waste Department Admin',
                role: 'SECTOR_ADMIN',
                department: 'Waste',
                isDisabled: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firebaseUid: 'road-admin-uid-placeholder',
                email: 'road-admin@cityfix.org',
                fullName: 'Road Department Admin',
                role: 'SECTOR_ADMIN',
                department: 'Road',
                isDisabled: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firebaseUid: 'electricity-admin-uid-placeholder',
                email: 'electricity-admin@cityfix.org',
                fullName: 'Electricity Department Admin',
                role: 'SECTOR_ADMIN',
                department: 'Electricity',
                isDisabled: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const result = await db.collection('users').insertMany(sectorAdmins);
        console.log('Sector admins inserted successfully:', result.insertedCount);
    } catch (e) {
        if (e.code === 11000) {
            console.log('One or more sector admins already exist (duplicate key error).');
        } else {
            console.error('Error seeding sector admins:', e);
        }
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedSectorAdmins();

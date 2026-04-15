const mongoose = require('mongoose');

async function updateAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/cityfix');
        const db = mongoose.connection.db;
        
        const result = await db.collection('users').updateOne(
            { email: 'admin@cityfix.org' },
            { $set: { firebaseUid: 'lGkVwWGU23Y5g4YZ5NGM96DgDf02' } }
        );
        
        console.log('Update result:', result);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

updateAdmin();

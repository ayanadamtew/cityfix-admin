const axios = require('axios');

async function testAuth() {
    const apiKey = 'AIzaSyDXGST3p0UuGJPmbG54UkfKdI49Xq7GINQ';
    const email = 'admin@cityfix.org';
    const password = 'admin123';

    try {
        // 1. Get Token
        console.log('Authenticating with Firebase...');
        const authRes = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
            email,
            password,
            returnSecureToken: true
        });

        const idToken = authRes.data.idToken;
        const localId = authRes.data.localId;
        console.log('Logged in! Firebase UID:', localId);
        // console.log('ID Token:', idToken);

        // 2. Call backend
        console.log('Calling backend /api/users/me...');
        try {
            const apiRes = await axios.get('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            console.log('Backend response:', apiRes.data);
        } catch (e) {
            console.error('Backend error status:', e.response?.status);
            console.error('Backend error message:', e.response?.data?.message);
        }
    } catch (e) {
        console.error('Firebase Auth error:', e.response?.data?.error?.message || e.message);
    }
}

testAuth();

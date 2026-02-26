const axios = require('axios');
(async () => {
  try {
    // Attempting a direct call to the backend without token to see specific JSON error
    const res = await axios.get('http://localhost:5000/api/users/me', {
      headers: { 'Authorization': 'Bearer INVALID_TOKEN' }
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Error Status:", err.response?.status);
    console.log("Error Body:", err.response?.data);
  }
})();

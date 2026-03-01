const axios = require('axios');

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            username: 'testuser_' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            password: 'password123',
            role: 'Citizen'
        });
        console.log('Registration Test Success:', res.data);

        // Test /me with the token
        const token = res.data.token;
        const resMe = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('/me Test Success:', resMe.data);
    } catch (err) {
        console.error('Test Failed:', err.response?.data || err.message);
    }
}

testRegister();

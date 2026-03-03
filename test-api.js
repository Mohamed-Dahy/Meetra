const axios = require('axios');

async function testAuth() {
  try {
    const response = await axios.post('http://localhost:5000/meetra/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  }
}

testAuth();

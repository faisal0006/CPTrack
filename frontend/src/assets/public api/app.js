const axios = require('axios');

async function getData() {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos');
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

getData();

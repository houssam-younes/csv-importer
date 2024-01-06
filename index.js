const express = require('express');
const pool = require('./db'); // Require your database pool
const app = express();
const port = 3000;

// const { Client } = require('pg')
// const client = new Client({
//   user: 'postgres',
//   host: '35.237.148.74',
//   socketPath: '/cloudsql/automatic-rock-409816:us-east1:demodb',
//   database: 'postgres',
//   password: '131619',
//   port: 5432,
// })
console.log('connecting');
client.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.use(express.static(__dirname)); // Serve static files
app.use(express.json()); // Middleware to parse JSON data

// Route to fetch sales data
// app.get('/sales-data', async (req, res) => {
app.get('/a', async (req, res) => {
  try {
    const inventoryData = await pool.query('SELECT * FROM inventory LIMIT 1');
    // res.json(salesData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/api/inventory', async (req, res) => {
    try {
        console.log('getting inventory data');
      //const queryResult = await pool.query('SELECT * FROM inventory LIMIT 100');
      const queryResult = await pool.query('SELECT * FROM inventory');
      res.json(queryResult.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error while fetching inventory');
    }
});

// Existing route to serve static files (if needed)
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html'); // Assuming you have an index.html in your project root
// });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

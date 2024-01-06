const express = require('express');
const pool = require('./db'); // Require your database pool
const app = express();
const port = 8080;

// console.log('connecting');
// client.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });
console.log('hello');

app.use(express.static(__dirname));
app.use(express.json());

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

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});

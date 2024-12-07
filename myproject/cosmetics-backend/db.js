
const mysql = require('mysql2');
const fs = require('fs');


const connection = mysql.createConnection({
  host: '34.69.171.186',
  user: 'root',
  password: 'root',
  database: 'beauty',
  port: 3306,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

// Test query
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);

  // Test query
  connection.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
      console.error('Error executing test query:', error);
      return;
    }
    console.log('Test query result:', results[0].solution);
  });
});

module.exports = connection;


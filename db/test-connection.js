const { loadEnvFile } = require('node:process');
loadEnvFile('.env');

const pool = require('./config');

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa a PostgreSQL');
    console.log('Hora del servidor de base de datos:', result.rows[0].now);
    await pool.end();
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error.message);
  }
}

testConnection();

const authors = async () => {
  const result = await pool.query('SELECT * FROM authors;');
  console.log(result.rows);
}

authors();

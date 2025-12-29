// oracleClient.js
// Centralized Oracle DB client for thin Node adapter

const oracledb = require('oracledb');

// You may want to use dotenv for credentials, but keeping minimal for now
const dbConfig = {
  user: process.env.DB_USER || 'your_db_user',
  password: process.env.DB_PASSWORD || 'your_db_password',
  connectString: process.env.DB_CONNECT_STRING || 'localhost/XEPDB1',
};

async function executeProcedure({ procedure, binds = {}, options = {} }) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `BEGIN ${procedure}; END;`,
      binds,
      options
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { /* ignore */ }
    }
  }
}

module.exports = {
  executeProcedure,
};

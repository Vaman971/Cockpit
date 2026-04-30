require('dotenv').config();
const { Sequelize } = require('sequelize');
const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: false,
});

async function dropAll() {
  await s.query('SET FOREIGN_KEY_CHECKS = 0');
  const [tables] = await s.query('SHOW TABLES');
  for (const row of tables) {
    const tableName = Object.values(row)[0];
    await s.query(`DROP TABLE IF EXISTS \`${tableName}\``);
    console.log('Dropped: ' + tableName);
  }
  await s.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Done. All tables dropped.');
  process.exit(0);
}

dropAll().catch(e => { console.error(e.message); process.exit(1); });

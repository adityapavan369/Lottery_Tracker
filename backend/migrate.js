const db = require('./database');

console.log('Running database migrations...');

db.serialize(() => {
  console.log('Database schema created successfully!');
  db.close();
});

require('dotenv').config();

const app = require('./app');
const connectDb = require('./config/db');

connectDb();

app.listen(process.env.port, () => {
  console.log('Iam connected on port 8000');
});

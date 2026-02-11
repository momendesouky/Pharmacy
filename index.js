require('dotenv').config();

const app = require('./app');
const connectDb = require('./config/db');

connectDb();

const PORT = process.env.port || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

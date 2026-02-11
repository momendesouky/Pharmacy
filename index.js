require('dotenv').config();

const app = require('./app');
const connectDb = require('./config/db');

const PORT = process.env.PORT || process.env.port || 8000;

connectDb();
app.listen(PORT, () => console.log(`Iam connected on port ${PORT}`));

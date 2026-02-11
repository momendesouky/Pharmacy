const mongoose = require('mongoose');

async function connectDb() {
  try {
    await mongoose.connect(process.env.mongoUrl);
    console.log('connected');
  } catch (error) {
    console.log('error');
  }
}

module.exports = connectDb;

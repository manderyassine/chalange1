import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
let memServer = null;

dotenv.config();

const PORT = process.env.PORT || 4000;
let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern_multi';

async function start() {
  try {
    if (MONGO_URI === 'memory') {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memServer = await MongoMemoryServer.create();
      MONGO_URI = memServer.getUri();
      console.log('Using in-memory MongoDB');
    }
    await mongoose.connect(MONGO_URI);
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Mongo connection error:', err.message);
    process.exit(1);
  }
}

start();

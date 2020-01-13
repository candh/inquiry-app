const mongoose = require("mongoose");
const logger = require("../helpers/logger");
const process = require("process");

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose
      .connect(process.env.MONGODB_URI, {
        useCreateIndex: true,
        useUnifiedTopology: true,
        useNewUrlParser: true
      })
      .then(() => {
        logger.info("Database connection successful");
        logger.info(`Database name: ${mongoose.connection.name}`);
      })
      .catch(err => {
        logger.error(err);
        logger.info("Database connection error");
      });
  }

  close() {
    const conn = mongoose.connection;
    conn.close();
  }
}

module.exports = new Database();

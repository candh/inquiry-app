var express = require("express");
var path = require("path");
const winston = require("winston");
// const expressWinston = require('express-winston');
let morgan = require("morgan");
var indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");
const { handleErrors } = require("./helpers/error");
const fs = require("fs");
const config = require("./config");

var app = express();

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(config.accessLogFile, {
  flags: "a",
});
// log only 4xx and 5xx responses to console
app.use(
  morgan("dev", {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
  })
);
app.use(morgan("common", { stream: accessLogStream }));

// app.use(expressWinston.logger({
//   transports: [
//     new winston.transports.Console({
//       json: false,
//       format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.simple(),
//         winston.format.prettyPrint()
//       )
//     }),
//     // new winston.transports.File({ filename: 'combined.log' })
//   ],
//   meta: true,
//   expressFormat: true,
//   colorize: true,
// }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "client/build")));

app.use("/api", apiRouter);

// Serve static files from the React frontend app
// Anything that doesn't match the above, send back index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

app.use(handleErrors);

module.exports = app;

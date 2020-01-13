// from https://dev.to/nedsoft/central-error-handling-in-express-3aej
const logger = require("./logger");

class ErrorHandler extends Error {
  constructor(code, msg) {
    super();
    this.statusCode = code;
    this.messages = [];
    this.ErrorHandler = true;
    if (Array.isArray(msg)) {
      this.messages = msg;
    } else {
      this.messages = new Array({ msg });
    }
  }
}

const handleError = (err, req, res, next) => {
  // JWT errors
  if (err.name == "UnauthorizedError") {
    err = new ErrorHandler(401, err.message); // chalo hamari trf se hi aya hai
  }

  let { statusCode, messages } = err;
  if (!err.ErrorHandler || res.headerSent) {
    return next(err);
  }

  logger.error(err.stack);
  res.status(statusCode).json({
    status: "error",
    statusCode,
    messages: messages
  });

  next();
};

function processValidationErrors(req, res, next) {
  const validationResult = require("express-validator").validationResult;
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ErrorHandler(500, errors.array());
  next();
}

module.exports = { ErrorHandler, handleError, processValidationErrors };

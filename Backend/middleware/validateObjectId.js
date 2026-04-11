const mongoose = require('mongoose');


const validateObjectId = (...paramNames) => (req, res, next) => {
  for (const param of paramNames) {
    if (!mongoose.Types.ObjectId.isValid(req.params[param])) {
      return res.status(400).json({ message: `Invalid ID format for parameter: ${param}` });
    }
  }
  next();
};

module.exports = validateObjectId;

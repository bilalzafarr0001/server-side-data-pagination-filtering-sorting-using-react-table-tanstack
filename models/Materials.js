const Mongoose = require("mongoose");

const materialsSchema = new Mongoose.Schema({
  number: String,
  status: String,
  rejectionReason: String,
  createdAt: Date,
  requestedDate: Date,
});

module.exports = Mongoose.model("materials", materialsSchema);

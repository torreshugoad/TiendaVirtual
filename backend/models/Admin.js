const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    usuario: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);

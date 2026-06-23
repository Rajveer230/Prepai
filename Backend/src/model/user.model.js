const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:   { type: String, required: true, unique: [true, "Username already exists"] },
    email:      { type: String, required: true, unique: [true, "Email already exists"] },
    password:   { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    otp:        { type: String, default: null },
    otpExpiry:  { type: Date, default: null },
});

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;

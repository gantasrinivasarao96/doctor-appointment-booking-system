const mongoose = require("mongoose");


// ======================================
// Connect MongoDB
// ======================================
const connectDB = async () => {
  await mongoose.connect(
    process.env.MONGO_URI
  );

  console.log(
    "✅ MongoDB Connected Successfully"
  );
};


module.exports = connectDB;

const mongoose = require("mongoose");



const connectDB = async () => {
  await mongoose.connect("mongodb+srv://rohitazad5050:PTC0C24jpM8KLcHF@nodejs.vaaip.mongodb.net/?retryWrites=true&w=majority&appName=nodejs");
};

module.exports = connectDB;
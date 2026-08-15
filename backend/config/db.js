const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongoDB connection successful");
    }
    catch(err) {
        console.error("failed to connect mongoDB: ", err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
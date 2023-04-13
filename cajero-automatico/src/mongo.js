import mongoose from "mongoose";

async function connectMongo() {
    await mongoose.connect('mongodb://127.0.0.1:27017/atm');
};

export default connectMongo;
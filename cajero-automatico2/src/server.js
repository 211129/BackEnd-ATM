import connectMongo from "./mongo.js";
import {connectRabbit} from "./listener.js";

const connect = async () => {
    await connectMongo();

    await connectRabbit();
};

connect();
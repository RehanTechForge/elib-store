import config from "../config/config.js";
import mongoose from "mongoose";

const connectDB = async (req, res) => {
    // const localURI = "mongodb://localhost:27017"
    try {
        const connectionInstance = await mongoose.connect(`${config.mongodb_uri}/elib`);

        connectionInstance.connection.on('error', (error) => {
            console.log(`Error connecting to ${error.message}`);
        });

        connectionInstance.connection.on("connected", () => {
            console.log(`Connect connection`);
        });

        connectionInstance.connection.on("disconnected", () => {
            console.log(`Connection disconnected`);
        });

        console.log(connectionInstance.connection.host);

    } catch (error) {
        res.status(504).json({
            error: error.message
        })
    }
}

export { connectDB }

import "dotenv/config";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";
import config from "./config/config.js";

connectDB()
    .then(() => {
        app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        })
    })
    .catch((err) => {
        console.log(`Error connecting to db: ${err}`);
    })


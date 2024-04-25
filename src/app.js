import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { DATA_LIMIT } from './constant.js';
import config from './config/config.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true,
    limit: DATA_LIMIT,
}));

app.use(cookieParser());

app.use(cors({
    origin: config.cors,
    credentials: true,
}));

app.use(express.static("public"));

import userRouter from "./routes/user.route.js";

app.use("/api/v1/users", userRouter);

import bookRouter from "./routes/book.route.js";

app.use("/api/v1/books", bookRouter);


export { app }
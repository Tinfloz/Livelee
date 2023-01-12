import express, { Request, Response, Express } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose, { ConnectOptions } from "mongoose";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 9000;

// connect to mongoose
mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true
} as ConnectOptions).then(res =>
    console.log("connected to mongo db")).catch(err => console.log(err))

// middlewares
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
app.use(bodyParser.json());

// test route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "server up and running!"
    });
});

app.listen(port, () => console.log(`running on port ${port}`));
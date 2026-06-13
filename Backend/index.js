import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from 'cors'
import connectDB from "./Config/mogodb.config.js";
import userRouter from "./Routes/User.router.js";
import cookieParser from "cookie-parser";
import postRouter from "./Routes/Post.router.js";
import consverSationRoutr from "./Routes/conversation.router.js";
//===== instance of express ======
const app = express();
// ===== Middlewares =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use('/user',userRouter);
app.use('/post',postRouter);
app.use('/conversation',consverSationRoutr);
const port = process.env.PORT || 3000;
app.listen(port, async () => {
    try {
        await connectDB();
        console.log(`server is live on ${port}`);
    } catch (error) {
        process.exit(1);
    }
})
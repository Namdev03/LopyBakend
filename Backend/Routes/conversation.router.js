import express from "express";
import userAuthentiction from "../Middlewares/UserAuthentiction.js";
import { sendMessage,getmessage } from "../Controller/Message..controller.js";
const consverSationRoutr = express.Router();
//=====Send Message ======
consverSationRoutr.post('/send/message/:id',userAuthentiction,sendMessage)
//=====Get message=====
consverSationRoutr.get('/get/message/:id',userAuthentiction,getmessage)
export default consverSationRoutr;
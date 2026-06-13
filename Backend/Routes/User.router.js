import express from "express";
import { registerUser,loginUser,logoutuser,userProfile,editProfile,getSuggestedUser,followOrUnfollow} from "../Controller/User.controller.js";
import userAuthentiction from "../Middlewares/UserAuthentiction.js";
import upload from "../Config/Multer.config.js";
//===== instance of express ======
const userRouter = express.Router();
//=====endpoints=====
//=====Register User=====
userRouter.post('/register',registerUser)
//=====Login user====
userRouter.post('/login',loginUser)
//=====Logout user====
userRouter.get('/logout',logoutuser)
//=====User Profile======
userRouter.get("/profile",userAuthentiction, userProfile);
//===== Edit User Profile======
userRouter.post("/profile/edit",userAuthentiction,upload.single('profilepic'),editProfile);
//===== suggested User Profile======
userRouter.get("/suggestedUser",userAuthentiction, getSuggestedUser);
//===== following and followers======
userRouter.post("/userprofile/:id",userAuthentiction,followOrUnfollow);
export default userRouter;
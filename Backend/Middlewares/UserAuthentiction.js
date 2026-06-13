import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const userAuthentiction = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "user not authenticated",
            })
        }
        const decode = await jwt.verify(token, process.env.SECRET_KEY)
        if (!decode) {
            return res.status(401).json({
                message: "user not authenticated"
            })
        }
       req.id = decode.userId;;
       next();
    }
    catch (error) {
 res.status(500).json({message:error.message})
    }

}
export default userAuthentiction
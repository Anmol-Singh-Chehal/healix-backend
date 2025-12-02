import jwt from "jsonwebtoken"
import { User } from "../lib/model/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const verifyJwt = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.header("authorization")?.replace("Bearer", "").trim();
        if(!token){
            return res.status(404).json(
                new ApiResponse(404, null, "Unauthorized access.")
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);
        if(!user){
            return res.status(404).json(
                new ApiResponse(404, null, "Unauthorized access.")
            );
        }
        req.user = user;
        next();

    } catch(error){
        return res.status(500).json(
            new ApiResponse(500, null, "Authentication failed.")
        );
    }
}
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/User.js"

const verifyJWT=asyncHandler(async(req,_,next)=>{

    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        console.log(token)
    
        if(!token){
            throw new ApiError(401,"unauthorized request")
        }
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_SECRET_KEY)
        // console.log("Cookies:", req.cookies);
        const user=await User.findOne({
            _id:decodedToken?._id,
            googleId:decodedToken?.gid
        }).select("-googleId -refreshToken")
        if(!user){
            throw new ApiError(401,"invalid token 1")
        }
        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message )
        
    }


})

export {verifyJWT}
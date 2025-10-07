import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {ApiError} from "../utils/apiError.js"
import axios from "axios"
import {verifyGoogleToken} from "../utils/verifyGoogleToken.js"
import { User } from '../models/User.js'
import jwt from "jsonwebtoken"

const options={
    httpOnly:true,
    secure: true,

     sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
}
const options_access={
    httpOnly:true,
    secure: true,

    sameSite: "Strict",
    maxAge: 15 * 60 * 1000, 
}

export const googleRedirectController=asyncHandler(async(req,res)=>{
    const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}` +
        `&response_type=code` +
        `&scope=openid%20email%20profile`;
    
    res.redirect(url);
})

export const googleCallbackController=asyncHandler(async(req,res)=>{
    const code=req.query.code;
    if(!code) throw new ApiError(400,"code missing in query");

    let tokenRes;
    try{
        tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code"
        });
    }catch(err){
        throw new ApiError(500,err.message)

    }

    const idToken=tokenRes.data.id_token
    const googleUser=await verifyGoogleToken(idToken)
    if(!googleUser) throw new ApiError(401,"invalid idToken");

    console.log(googleUser,"GOOGLE USER")
    let user=await User.findOne({email:googleUser.email})
    if(!user){
        user=await User.create({
            name:googleUser.name,email:googleUser.email
        })
    }
    user.googleId=googleUser.sub
    await user.save();

    const accessToken= jwt.sign({_id:user._id,email:user.email,gid:user.googleId},process.env.ACCESS_SECRET_KEY,{expiresIn:process.env.ACCESS_EXPIRY})
    const refreshToken= jwt.sign({id:user._id,gid:user.googleId},process.env.REFRESH_SECRET_KEY,{expiresIn:process.env.REFRESH_EXPIRY})
    console.log(accessToken)
    user.refreshToken=refreshToken
    await user.save();

    res.cookie("refreshToken",refreshToken,options).cookie("accessToken",accessToken,options_access)
    res.redirect(process.env.FRONTEND_REDIRECT_URI)
})
import mongoose from "mongoose"

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:[true,"Provide email"],
        unique:true,
    },
    googleId:{
        type:String
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})

export const User=mongoose.model('User',userSchema)
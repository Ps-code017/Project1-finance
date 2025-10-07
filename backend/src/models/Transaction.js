import mongoose from "mongoose"

const transactionSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    amount:{
        type:Number,
        required:true,
    },
    type:{
        type:String,
        enum:['debit','credit'],
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    merchant:{
        type:String,
        required:true
    },
    category:{
        type:String
    }
},{timestamps:true})

export const transaction=mongoose.model("Transaction",transactionSchema)
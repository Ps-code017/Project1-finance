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
    monthKey: {
        type: String, // 'YYYY-MM'
        index: true   // enables fast lookups by month
    },
    merchant:{
        type:String,
        required:true
    },
    category:{
        type:String,
        default:"Uncategorized"
    }
},{timestamps:true})

transactionSchema.pre("save",function(next){
    if(!this.monthKey && this.date){
        this.monthKey=this.date.toISOString().slice(0,7)
    }
    next();
})

transactionSchema.index({ user: 1, monthKey: 1 });

export const Transaction=mongoose.model("Transaction",transactionSchema)
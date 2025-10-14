import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Transaction } from "../models/Transaction.js";
import { MonthlyBudget } from "../models/MonthlyBudget.js";

const getMonthKey=(date)=>{
    return date.toISOString().slice(0,7);
}


export const getMonthlySummary=asyncHandler(async(req,res)=>{
    try {
        const monthKey=req.query.monthKey
        if(!monthKey) throw new ApiError(400,"monthKey not provided in query");
    
        const userId=req.user._id;
    
        const spendings=await Transaction.aggregate([
            {
                $match:{
                    user:userId,
                    monthKey,
                    type:'debit'
                }
            },{
                $group:{
                    _id:'$category',
                    totalSpent:{$sum:'$amount'}
                }
            },{
                $sort:{totalSpent:-1}
            }
        ])
    
        const budget=await MonthlyBudget.findOne({userId,monthKey});
    
        const income=await Transaction.aggregate([
            {
                $match:{
                    user:userId,monthKey,type:'credit'
                }
            },{
                $group:{
                    _id:null,total:{$sum:'$amount'}
                }
            }
        ])
    
        const totalExpense=spendings.reduce((sum,item)=>sum+item.totalSpent,0);
    
        const response={
            monthKey,
            budget,
            income,
            expense:totalExpense,
            spendings
        }
        return res.status(200).json(new ApiResponse(200,"summary of the given month",response))
    } catch (error) {
        console.error("error in dashboard controller")
        throw new ApiError(500,error.message)
    }
})

export const getspendingTrends=asyncHandler(async(req,res)=>{
    const sixMonthsAgo=new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-5)
    sixMonthsAgo.setDate(1);
    const startMonthKey=getMonthKey(sixMonthsAgo);

    const trends=await MonthlyBudget.aggregate([
        {
            $match:{
                userId:req.user._id,
                monthKey:{$gte:startMonthKey}
            }
        },{
            $project:{
                _id:0,
                monthKey:'$monthKey',
                totalLimit:'$totalLimit',
                totalSpent:'$totalSpent'
            }
        },{
            $sort:{monthKey:1}
        }
    ])

    return res.status(200).json(new ApiResponse(200,"trends for six months ago",trends))
})
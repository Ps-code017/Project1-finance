import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { MonthlyBudget } from "../models/MonthlyBudget.js";

const getMonthKey=(date)=>{
    return date.toISOString().slice(0,7);
}

export const getAllBudget=asyncHandler(async(req,res)=>{
    const budgets=await MonthlyBudget.find({userId:req.user._id}).sort({monthKey:-1})
    return res.stauts(200).json(new ApiResponse(200,"all budgets fetched",budgets))
})

export const getBudgetByMonthKey=asyncHandler(async(req,res)=>{
    const monthKey=req.params.monthKey;
    const budget=await MonthlyBudget.findOne({userId:req.user._id,monthKey})
    if(!budget) throw new ApiError(400,"no budget found for this month")

    return res.stauts(200).json(new ApiResponse(200,"budget for month successful",budget))
})

export const createOrUpdateBudget=asyncHandler(async(req,res)=>{
    try {
        const {monthKey,totalLimit,categoryBudgets}=req.body
        const currentMonth=monthKey||getMonthKey(new Date())
    
        let budget=await MonthlyBudget.findOneAndUpdate({userId:req.user._id,monthKey:currentMonth},
            {
                $set:{totalLimit,categoryBudgets}
            },
            {new:true,upsert:true,runValidators:true}
        )
        return res.status(200).json(new ApiResponse(200,"created/updated the budget",budget))
    } catch (error) {
        throw new ApiError(400,error.message)
    }
})

export const deleteBudgetById=asyncHandler(async(req,res)=>{
    const budget=await MonthlyBudget.findOneAndDelete({_id:req.params.id,userId:req.user._id});
    if(!budget) throw new ApiError(404,"no budget found for this month");

    res.status(200).json(new ApiResponse(200,'budget deleted',budget));
})

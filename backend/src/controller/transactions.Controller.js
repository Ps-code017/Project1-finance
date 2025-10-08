import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Transaction } from "../models/Transaction.js";
import { updateBudgetonTransaction } from "../services/budgetService.js";

const getMonthKey = (date) => {
    return date.toISOString().slice(0, 7); // 'YYYY-MM'
};

export const getAllTransactionsByMonth=asyncHandler(async(req,res)=>{
    const monthKey=req.query.monthKey;
    if(!monthKey) throw new ApiError(404,"monthkey not provided");

    const transactions=await Transaction.find({user:req.user._id,monthKey}).sort({date:-1});

    return res.status(200).json(new ApiResponse(200,"all transaction fetched",transactions))
})

export const createTransaction=asyncHandler(async(req,res)=>{
    const transaction=await Transaction.create({
        ...req.body,
        user:req.user._id,
        category:req.body.category||"Uncategorized",
    })
    await updateBudgetonTransaction(transaction,transaction.amount,null);
    res.status(200).json(new ApiResponse(200,"transaction created",transaction))
})

export const updateTransactionById=asyncHandler(async(req,res)=>{
    const existingTransaction=await Transaction.find({_id:req.params.id,user:req.user._id})
    if(!existingTransaction) throw new ApiError(404,"no such transaction");

    const existingAmount=existingTransaction.amount,existingCategory=existingTransaction.category

    const newCategory=req.body.newCategory || existingCategory
    const newAmount=req.body.newAmount || existingAmount

    const updatedTransaction=await Transaction.findOneAndUpdate({_id:req.params.id,user:req.user._id},
        {
            $set:{category:newCategory,amount:newAmount}
        },{new:true,runValidators:true}
    )

    const deltaAmount=newAmount-existingAmount;
    if(deltaAmount!=0 || existingCategory!=newCategory){
        await updateBudgetonTransaction(updatedTransaction,deltaAmount,existingCategory);
    }

    return res.status(200).json(new ApiResponse(200,"transaction updated",updatedTransaction))
})

export const deleteTransactionById=asyncHandler(async(req,res)=>{
    const existingTransaction=await Transaction.findOneAndDelete({_id:req.params.id,user:req.user._id})
    if(!existingTransaction) throw new ApiError(404,"no such transaction");

    const existingAmount=existingTransaction.amount,existingCategory=existingTransaction.category
    const deltaAmount=-existingAmount
    await updateBudgetonTransaction(existingTransaction,deltaAmount,existingCategory);

    return res.status(200).json(new ApiResponse(200,"transaction deleted successfully",existingTransaction))
})
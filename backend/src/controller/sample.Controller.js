import { ApiResponse } from "../utils/apiResponse.js"

export const sampleController=(req,res)=>{
    return res.status(200).json(new ApiResponse(200,"sample",{hi:"hi"}))
}
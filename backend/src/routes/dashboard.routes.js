import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getMonthlySummary, getspendingTrends } from "../controller/dashborad.Controller.js";
const router=Router();

router.get('/summary',verifyJWT,getMonthlySummary)
router.get('/trends',verifyJWT,getspendingTrends)

export default router;
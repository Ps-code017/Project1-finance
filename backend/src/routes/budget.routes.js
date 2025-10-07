import { Router } from "express";
import { createOrUpdateBudget, deleteBudgetById, getAllBudget, getBudgetByMonthKey } from "../controller/budget.Controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router=Router()

router.route('/').get(verifyJWT,getAllBudget).post(verifyJWT,createOrUpdateBudget)
router.get('/:monthkey',getBudgetByMonthKey)
router.delete('/:id',deleteBudgetById)

export default router
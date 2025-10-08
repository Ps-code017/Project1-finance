import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createTransaction, deleteTransactionById, getAllTransactionsByMonth, updateTransactionById } from "../controller/transactions.Controller.js";
const router=Router();

router.route('/').get(verifyJWT,getAllTransactionsByMonth).post(verifyJWT,createTransaction)
router.route('/:id').put(verifyJWT,updateTransactionById).delete(verifyJWT,deleteTransactionById)

export default router;
import { Router } from "express";
const router=Router();
import { sampleController } from "../controller/sample.Controller.js";

router.get('/sample',sampleController)

export default router
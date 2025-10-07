import {Router} from "express"
import { googleCallbackController,googleRedirectController } from "../controller/auth.Controller.js";

const router=Router();

router.get('/google',googleRedirectController)
router.get('/google/callback',googleCallbackController)

export default router
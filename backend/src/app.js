import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

//import routes
import authRouter from "./routes/auth.routes.js"
import sampleRouter from "./routes/sample.routes.js"
import budgetRouter from "./routes/budget.routes.js"

//give path to routes app.use('/api/home',homerouter)
app.use('/api/auth',authRouter)
app.use('/api/sample',sampleRouter)
app.use('/api/budget',budgetRouter)
export {app};
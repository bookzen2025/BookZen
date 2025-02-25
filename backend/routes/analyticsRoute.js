import express from "express";
import { getDashboardData } from "../controllers/analyticsController.js";
import adminAuth from "../middleware/adminAuth.js";

const analyticsRouter = express.Router();

analyticsRouter.post('/dashboard', adminAuth, getDashboardData);

export default analyticsRouter;
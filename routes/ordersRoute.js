import express from 'express';
import { createOrder, confirmOrder, cancelOrder, getUserOrders, markOrderAsUsed, getOrdersById, getAdminStats} from '../controllers/ordersController.js';
// ייבוא פונקצית האבטחה
import {verifyAdmin, verifyToken } from '../middlewares/authMiddleware.js';


const ordersRouter = express.Router();

// כל פעולות ההזמנה דורשות משתמש רשום ומחובר
ordersRouter.post('/create', verifyToken, createOrder);
ordersRouter.put('/confirm/:id', verifyToken, confirmOrder);
ordersRouter.put('/cancel/:id', verifyToken, cancelOrder);

ordersRouter.put('/use/:id', verifyToken, verifyAdmin, markOrderAsUsed);
ordersRouter.get('/search/:id', verifyToken, verifyAdmin, getOrdersById);
ordersRouter.get('/stats', verifyToken, verifyAdmin, getAdminStats);

ordersRouter.get('/user/:userId', verifyToken, getUserOrders);

export default ordersRouter;
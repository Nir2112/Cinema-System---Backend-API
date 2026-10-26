import express from 'express';
import { getAllHalls, createHall, updateHallStatus } from '../controllers/hallsController.js';
// ייבוא פונקציות האבטחה
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';

const hallsRouter = express.Router();

hallsRouter.get('/all', getAllHalls);
// נתיבים מוגנים - רק משתמש מחובר שהוא גם אדמין יכול ליצור/לערוך אולם
hallsRouter.post('/add', verifyToken, verifyAdmin, createHall);
hallsRouter.put('/update/:id', verifyToken, verifyAdmin, updateHallStatus);

export default hallsRouter;
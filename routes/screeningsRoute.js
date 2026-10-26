import express from 'express';
import { getAllScreenings, getScreeningById, getScreeningsByMovie, createScreening } from '../controllers/screeningsController.js';
// ייבוא פונקציות האבטחה
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';

const screeningsRouter = express.Router();

// נתיבים פתוחים - צפייה בלוח ההקרנות ובמצב המושבים פתוחה לכולם
screeningsRouter.get('/all', getAllScreenings);
screeningsRouter.get('/:id', getScreeningById);
screeningsRouter.get('/movie/:movieId', getScreeningsByMovie);
// נתיב מוגן - רק מנהל מערכת מורשה לקבוע הקרנות חדשות
screeningsRouter.post('/add', verifyToken, verifyAdmin, createScreening);

export default screeningsRouter;
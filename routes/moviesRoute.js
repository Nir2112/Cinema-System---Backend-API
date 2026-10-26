import express from 'express';
import { getAllMovies, getMovieById, createMovie, updateMovie } from '../controllers/moviesController.js';
// ייבוא פונקציות האבטחה
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';

const moviesRouter = express.Router();

// נתיבים פתוחים לכולם - כל אחד יכול לראות אילו סרטים יש
moviesRouter.get('/all', getAllMovies);
moviesRouter.get('/:id', getMovieById); 
// נתיבים מוגנים - רק מנהל יכול להוסיף או לעדכן סרט
// שרשור המידלוורס: קודם בודקים אם יש טוקן (מחובר), ואז אם התפקיד שלו הוא מנהל
moviesRouter.post('/add', verifyToken, verifyAdmin, createMovie);
moviesRouter.put('/update/:id', verifyToken, verifyAdmin, updateMovie);

moviesRouter.post('/adding', createMovie);
moviesRouter.put('/updating/:id', updateMovie);

export default moviesRouter;
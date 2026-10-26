import express from 'express';
import { getAllUsers, getMe, getUserById, updateUser, deleteUser} from '../controllers/usersController.js';
// ייבוא פונקציות האבטחה
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';

const usersRouter = express.Router();


usersRouter.get('/all', getAllUsers);

// נתיבים מוגנים למשתמשים מחוברים - צפייה, עדכון ומחיקה של פרופיל
usersRouter.get('/me', verifyToken, getMe);
usersRouter.get('/:id', verifyToken, getUserById);
usersRouter.put('/update/:id', updateUser);
usersRouter.delete('/delete/:id', verifyToken, deleteUser);

export default usersRouter;
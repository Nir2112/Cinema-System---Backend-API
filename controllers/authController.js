import usersModel from '../MongoDB/Models/users.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// POST - יצירת משתמש חדש עם סיסמה מוצפנת
export const register = async (req, res) => {
    try {
        const { id, name, birthday, phone, email, password, role } = req.body;

        // בדיקה האם המשתמש כבר קיים
        const existingUser = await usersModel.findOne({ id });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this ID" });
        }

        // יצירת משתמש
        // מתחת למכסה המנוע, הפקודה create של Mongoose עושה שני דברים:
        // בונה אובייקט חדש מהנתונים שלך.
        // קוראת לפקודת .save() הפנימית של מונגוס על האובייקט הזה.
        // ברגע שהפקודה הפנימית .save() מופעלת,
        // מונגוס אוטומטית מזהה שהגדרת לו אירוע pre('save'), 
        // והוא מריץ את פונקציית ההצפנה
        const newUser = await usersModel.create({
            id,
            name,
            birthday,
            phone,
            email,
            password,
            role // 'user' / 'admin'
        });

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// POST - התחברות ויצירת JWT
export const login = async (req, res) => {
    try {
        const { id, password } = req.body;

        // מציאת המתמש
        const user = await usersModel.findOne({ id });
        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" });
        }

        // השוואת הסיסמה שסופקה מול הסיסמה בממסד נתונים
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // יצירת ה JWT המכיל user's DB _id,  id, role
        const token = jwt.sign(
            { _id: user._id, id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // הטוקן פג תוקף אחרי יום 1
        );

        res.status(200).json({ token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
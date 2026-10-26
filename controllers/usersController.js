import usersModel from '../MongoDB/Models/users.js';

// פונקציה אסינכרונית לשליפת כל המשתמשים
export const getAllUsers = async (req, res) => {
    try {
        // המילה await אומרת לשרת לעצור ולחכות עד ש-MongoDB יחזיר את המידע
        const data = await usersModel.find({}).select('-password'); // לא מחזירים את הסיסמאות של המשתמשים
        // מחזירים סטטוס 200 (הצלחה) ואת הנתונים בפורמט JSON
        res.status(200).json(data);
    } catch (err) {
        // אם משהו נכשל, תופסים את השגיאה ומחזירים סטטוס 400 עם הודעת השגיאה
        res.status(400).json({ message: err.message });
    }
};
export const getUserById= async(req,res) => {
    try{
        const user = await usersModel.findOne({id:req.params.id}).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found"});
        }
        res.status(200).json(user);
    } catch(err){
        res.status(400).json({ message: err.message });    
    }
};

// GET - משיכת פרטי המשתמש המחובר על סמך הטוקן שלו
export const getMe = async (req, res) => {
    try {
        // אני מניח שה-verifyToken שלך מכניס את נתוני הטוקן ל-req.user
        // אם הוא קורא לזה אחרת (למשל req.userId), שנה בהתאם:
        const user = await usersModel.findById(req.user._id).select('-password');;
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT - עדכון פרטי משתמש לפי תעודת זהות (id)
export const updateUser = async (req, res) => {
    try {
        // 1. קודם נמצא את המשתמש בעזרת findOne (ולא findOneAndUpdate)
        const user = await usersModel.findOne({ id: req.params.id });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. נעדכן את השדות בזיכרון אחד אחד לפי המידע שהגיע בבקשה (req.body)
        const updates = Object.keys(req.body);
        updates.forEach((update) => {
            user[update] = req.body[update];
        });

        // 3. נקרא במפורש לפונקציית save של מונגוס!
        // הפעולה הזו תפעיל את ה-Hook שלנו מסכמת המשתמש, ותצפין את הסיסמה אם היא עודכנה.
        await user.save();

        // 4. נמיר לאובייקט רגיל ונסנן את הסיסמה כדי שלא תוחזר ללקוח
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json(userResponse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE - מחיקת משתמש לפי תעודת זהות (id)
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await usersModel.findOneAndDelete({ id: req.params.id });

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
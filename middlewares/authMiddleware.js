import jwt from 'jsonwebtoken';

// פונקציית אמצע (Middleware) לבדיקה אם המשתמש מחובר (כלומר, יש לו טוקן תקין)
export const verifyToken = (req, res, next) => {
    // קבלת הטוקן מ (Header) של הבקשה
    const token = req.header('Authorization');

    //אם אין טוקן, אנחנו חוסמים את הגישה
    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        //בדרך כלל הטוקן מגיע בפורמט "Bearer <token_string>", לכן צריך לפצל ולקחת את החלק השני
        const tokenString = token.split(" ")[1];

        // אימות הטוקן בעזרת המפתח הסודי שלנו
        const verified = jwt.verify(tokenString, process.env.JWT_SECRET);
        
        //הוספת נתוני המשתמש המאומתים (id, role) לאובייקט הבקשה כדי שהקונטרולר יוכל להשתמש בהם
        req.user = verified;
        
        // המשך לפונקציה הבאה (הקונטרולר)
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token." });
    }
};

// פונקציית אמצע (Middleware) לבדיקה אם המשתמש הוא מנהל (Admin)
export const verifyAdmin = (req, res, next) => {
    //  קודם כל נריץ את verifyToken (נשרשר אותם בראוטר)
    //  בדיקת התפקיד (role) שחילצנו מהטוקן קודם לכן
    if (req.user && req.user.role === 'admin') {
        next(); // המשתמש הוא מנהל, תן לו לעבור
    } else {
        return res.status(403).json({ message: "Access Denied. Admin permissions required." });
    }
};
import ordersModel from '../MongoDB/Models/orders.js';
import screeningModel from '../MongoDB/Models/screening.js';
import userModel from '../MongoDB/Models/users.js';

// POST - יצירת הזמנה חדשה (סטטוס Pending) ונעילת מושבים
export const createOrder = async (req, res) => {
    try {
        const { screeningId, seats, totalAmount } = req.body;

        // שולפים את מזהה המשתמש מה-Middleware
        const userId = req.user._id;

        //  נסיון לעדכן את ההקרנה ולתפוס את המושבים בפעולה אטומית אחת!
        // $nin (Not In): מוודא שאף אחד מהמושבים המבוקשים לא נמצא כבר במערך
        // $push + $each: דוחף את כל המושבים למערך אם התנאי מתקיים
        const updatedScreening = await screeningModel.findOneAndUpdate(
            { 
                _id: screeningId, 
                bookedSeats: { $nin: seats } // תנאי קריטי: אף כיסא לא תפוס
            },
            { 
                $push: { bookedSeats: { $each: seats } } // הוספת הכיסאות
            },
            { new: true }
        );

        //  אם findOneAndUpdate החזיר null, זה אומר שהתנאי לא התקיים - מישהו כבר תפס את הכיסא!
        if (!updatedScreening) {
            return res.status(409).json({ 
                message: "Concurrency conflict: One or more selected seats are already booked." 
            });
        }

        //  המושבים ננעלו בהצלחה במסד הנתונים, כעת ניצור את ההזמנה
        const newOrder = await ordersModel.create({
            userId,
            screeningId,
            seats,
            totalAmount
            // status default is 'Pending'
        });

        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT - אישור תשלום והפיכת הזמנה ל-Completed
export const confirmOrder = async (req, res) => {
    try {
        const order = await ordersModel.findByIdAndUpdate(
            req.params.id,
            { status: 'Completed' },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT - ביטול הזמנה (שחרור מושבים חזרה לקהל)
export const cancelOrder = async (req, res) => {
    try {
        const order = await ordersModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        //  נשנה את הסטטוס ל-Cancelled
        order.status = 'Cancelled';
        await order.save();

        //  נוציא (Pull) את המושבים מתוך מערך ה-bookedSeats של ההקרנה
        await screeningModel.findByIdAndUpdate(order.screeningId, {
            $pull: { bookedSeats: { $in: order.seats } }
        });

        res.status(200).json({ message: "Order cancelled and seats released successfully", order });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET - שליפת היסטוריית הזמנות של משתמש ספציפי
export const getUserOrders = async (req, res) => {
    try {
        // מציאת כל ההזמנות ששייכות ל-ID של המשתמש
        // והרחבת המידע של ההקרנה, הסרט והאולם כדי שהאפליקציה תוכל להציג אותם
        const orders = await ordersModel.find({ userId: req.params.userId })
            .populate({
                path: 'screeningId',
                populate: [
                    { path: 'movieId' },
                    { path: 'hallId' }
                ]
            });
        res.status(200).json(orders);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT - סימון הזמנה כמומשה (כרטיס נוצל)
export const markOrderAsUsed = async (req, res) => {
    try {
        const order = await ordersModel.findByIdAndUpdate(
            req.params.id,
            { status: 'Used' },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET - חיפוש הזמנות של לקוח לפי תעודת זהות (עבור קופאי/סדרן)
export const getOrdersById = async (req, res) => {
    try {
        // קודם מוצאים את המשתמש לפי תעודת הזהות שלו
        const user = await userModel.findOne({ id: req.params.id });
        if (!user) {
            return res.status(404).json({ message: "No user found with this ID number." });
        }

        // שולפים את ההזמנות של המשתמש כולל המידע על ההקרנה, הסרט והאולם
        const orders = await ordersModel.find({ userId: user._id })
            .populate({
                path: 'screeningId',
                populate: [
                    { path: 'movieId' },
                    { path: 'hallId' }
                ]
            });
            
        // מחזירים אובייקט שמכיל גם את המשתמש וגם את ההזמנות שלו
        res.status(200).json({ user, orders });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
// GET - שליפת סטטיסטיקות מתקדמות למנהל (כולל פילוח לפי סרט וטווח תאריכים)
export const getAdminStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // בניית אובייקט החיפוש הבסיסי - רק הזמנות פעילות
        const query = { status: { $in: ['Completed', 'Used'] } };

        // אם המנהל שלח תאריכים, נוסיף סינון לפי תאריך יצירת ההזמנה (createdAt)
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate); // גדול או שווה לתאריך ההתחלה
            }
            if (endDate) {
                const end = new Date(endDate);
                // מכוונים את השעה לסוף היום (23:59:59) כדי שהיום האחרון ייכלל במלואו
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end; // קטן או שווה לתאריך הסיום
            }
        }

        // שולפים את ההזמנות (עם הסינון אם יש) ומוסיפים את פרטי הסרט
        const orders = await ordersModel.find(query)
            .populate({
                path: 'screeningId',
                populate: { path: 'movieId', select: 'title posterUrl' }
            });
        
        let totalRevenue = 0;
        let totalTickets = 0;
        const moviesStats = {};

        orders.forEach(order => {
            const amount = order.totalAmount || 0;
            const tickets = order.seats?.length || 0;
            
            totalRevenue += amount;
            totalTickets += tickets;

            if (order.screeningId && order.screeningId.movieId) {
                const movieId = order.screeningId.movieId._id.toString();
                const movieTitle = order.screeningId.movieId.title;

                if (!moviesStats[movieId]) {
                    moviesStats[movieId] = { title: movieTitle, revenue: 0, tickets: 0 };
                }
                moviesStats[movieId].revenue += amount;
                moviesStats[movieId].tickets += tickets;
            }
        });

        const moviesArray = Object.values(moviesStats).sort((a, b) => b.revenue - a.revenue);
        const topMovie = moviesArray.length > 0 ? moviesArray[0] : null;

        res.status(200).json({
            totalRevenue,
            totalTickets,
            totalOrders: orders.length,
            moviesStats: moviesArray,
            topMovie 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
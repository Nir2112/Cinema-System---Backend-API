import screeningModel from '../MongoDB/Models/screening.js';
import moviesModel from '../MongoDB/Models/movies.js';

// GET - שליפת כל ההקרנות
export const getAllScreenings = async (req, res) => {
    try {
        const screenings = await screeningModel.find({})
            .populate('movieId')
            .populate('hallId');
        res.status(200).json(screenings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET - שליפת הקרנה ספציפית לפי ID (חשוב מאוד לרינדור מפת המושבים ב-React)
export const getScreeningById = async (req, res) => {
    try {
        const screening = await screeningModel.findById(req.params.id).populate('hallId');
        if (!screening) {
            return res.status(404).json({ message: "Screening not found" });
        }
        res.status(200).json(screening);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET - שליפת הקרנות לפי מזהה סרט (כשהלקוח לוחץ על סרט ורוצה לראות מתי הוא מוקרן)
export const getScreeningsByMovie = async (req, res) => {
    try {
        // הוספנו את populate כדי להביא את נתוני האולם המלאים מתוך קולקציית האולמות
        const screenings = await screeningModel.find({ movieId: req.params.movieId }).populate('hallId');
        res.status(200).json(screenings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// POST - יצירת הקרנה חדשה עם אלגוריתם למניעת התנגשויות זמנים
export const createScreening = async (req, res) => {
    try {
        const { movieId, hallId, startTime, price } = req.body;

        // שליפת הסרט כדי לדעת מה האורך שלו
        const movie = await moviesModel.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        //  חישוב זמן הסיום של ההקרנה
        // ממירים את זמן ההתחלה לאובייקט תאריך, ומוסיפים לו את אורך הסרט + 20 דקות ניקיון (במילישניות)
        const start = new Date(startTime);
        const end = new Date(start.getTime() + (movie.durationInMinutes + 20) * 60000);

        //  אלגוריתם בדיקת חפיפת זמנים באותו אולם
        //  במקום לבדוק מתי יש חפיפה, יש בדיקה מתי בטוח אין חפיפה
        //  היסמן $ אומר למונגו להשים לה שזה אופרטור שמבצע פעולה לוגית או מתמטית
        // $lt = Less Than (קטן מ) | $gt = Greater Than (גדול מ)
        const conflictingScreening = await screeningModel.findOne({
            hallId: hallId,// חייב להיות באותו אולם, אחרת אין בעיה
            $and: [
                { startTime: { $lt: end } },// זמן התחלה קיים קטן מזמן סיום חדש
                { endTime: { $gt: start } }// זמן סיום קיים גדול מזמן התחלה חדש
            ]
        });

        if (conflictingScreening) {
            return res.status(409).json({ 
                message: "Time conflict: There is already a screening in this hall during the requested time." 
            });
        }

        //  אם אין התנגשות, ניצור את ההקרנה
        const newScreening = await screeningModel.create({
            movieId,
            hallId,
            startTime: start,
            endTime: end, // השדה המחושב שהגדרנו בסכמה
            price
            // bookedSeats יקבל אוטומטית מערך ריק לפי הסכמה
            // status יקבל אוטומטית 'Scheduled' לפי הסכמה
        });

        res.status(201).json(newScreening);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
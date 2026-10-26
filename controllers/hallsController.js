import hallsModel from '../MongoDB/Models/halls.js'; // שים לב לשם הקובץ של המודל שלך

// GET - שליפת כל האולמות
export const getAllHalls = async (req, res) => {
    try {
        const halls = await hallsModel.find({});
        res.status(200).json(halls);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// POST - הוספת אולם חדש (עבור מנהל המערכת)
export const createHall = async (req, res) => {
    try {
        const newHall = await hallsModel.create(req.body);
        res.status(201).json(newHall);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT - עדכון סטטוס אולם (עבור מנהל המערכת)
export const updateHallStatus = async (req, res) => {
    try {
        // אנחנו שולפים את הסטטוס מהבקשה, ומעדכנים את האולם לפי ה-ID מהנתיב
        const updatedHall = await hallsModel.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true } // new: מחזיר את האולם המעודכן, runValidators: אוכף את מגבלות הסכמה
        );

        if (!updatedHall) {
            return res.status(404).json({ message: "Hall not found" });
        }

        res.status(200).json(updatedHall);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
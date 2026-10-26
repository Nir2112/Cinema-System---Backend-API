import mongoose from "mongoose";

const screeningSchema= mongoose.Schema({
    // הפניה לאוסף הסרטים
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'movies',
        required: true
    },
    // הפניה לאוסף האולמות
    hallId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'halls',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true // מחושב בשרת לפי זמן התחלה + אורך הסרט
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    // מערך של מושבים תפוסים להקרנה זו בלבד (למשל: ['A-1', 'A-2', 'B-5'])
    bookedSeats: {
        type: [String],
        default: []
    },
    // ניהול מצב ההקרנה: מאפשר לבטל הקרנה (Cancelled) או לסמן שהסתיימה (Finished) מבלי למחוק אותה מהמסד, כדי לא לשבור את היסטוריית ההזמנות
    status: {
        type: String,
        enum: ['Scheduled', 'Cancelled', 'Finished'],
        default: 'Scheduled'
    }
},{
    timestamps: true// הוספת מעקב אוטומטי אחר זמני יצירה ועדכון של האולם
})

export default mongoose.model("screening",screeningSchema)
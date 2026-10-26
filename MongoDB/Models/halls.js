import mongoose from "mongoose";

const hallsSchema= mongoose.Schema({
    name: { // למשל 'Hall 1'
        type: String,
        required: true,
        unique: true // למשל: "אולם 1", "אולם VIP"
    },
    // סך הכל כיסאות
    capacity: {
        type: Number,
        required: true
    },
    seatLayout: {
        rows: { type: Number, required: true },// כמה שורות יש באולם
        seatsPerRow: { type: Number, required: true }// כמה כיסאות יש בכל שורה
    },
    // מצב האולם: מאפשר למנוע שיבוץ הקרנות חדשות באולם שנמצא בשיפוצים או תחזוקה
    status: {
        type: String,
        enum: ['Active', 'Maintenance'],
        default: 'Active'
    }
},{
    timestamps: true // הוספת מעקב אוטומטי אחר זמני יצירה ועדכון של האולם
})

export default mongoose.model("halls",hallsSchema)
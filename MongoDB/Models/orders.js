import mongoose from "mongoose";

const ordersSchema= mongoose.Schema({
    // הפניה לאוסף המשתמשים (מי קנה)
    userId: {
        type: mongoose.Schema.Types.ObjectId,//השדה הזה אינו שומר מידע רגיל (כמו טקסט או מספר), אלא מצביע (Reference/קישור) למסמך אחר ב-MongoDB.
        ref: 'User',
        required: true
    },
    // הפניה לאוסף ההקרנות
    screeningId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'screening',
        required: true
    },
    // המושבים שנרכשו בהזמנה הספציפית הזו
    seats: {
        type: [String],
        required: true,
        validate: [v => v.length > 0, 'חובה לבחור לפחות מושב אחד']
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    //מניעת כפילויות ותפיסת מושבים
    //המערכת שומרת את המושב לכמה דקות כדי שאף אחד לא יקנה אותו במקביל
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Used', 'Cancelled'],
        default: 'Pending'
    },
},{
    timestamps: true// הוספת מעקב אוטומטי אחר זמני יצירה ועדכון של האולם
})

export default mongoose.model("orders",ordersSchema)
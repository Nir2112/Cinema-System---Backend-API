import mongoose from "mongoose";

const moviesSchema= mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    durationInMinutes: {
        type: Number,
        required: true,
        min: 1
    },
    ageRating: {
        type: String,
        enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
        required: true 
    },
    posterUrl: {
        type: String,
        required: true
    },
    trailerUrl: {
        type: String,
        required: false, // לא חובה
        match: [/^https?:\/\/.+/, 'Invalid URL'] // מוודא שזה מתחיל ב-http או https
    },
    genres: {
        type: [String],
        required: true,
        default: []
    },
    status: {
        type: String,
        enum: ['Now Playing', 'Coming Soon', 'Archived'],
        default: 'Coming Soon'
    },
   
},{
    timestamps: true// הוספת מעקב אוטומטי אחר זמני יצירה ועדכון של האולם
})

export default mongoose.model("movies",moviesSchema)
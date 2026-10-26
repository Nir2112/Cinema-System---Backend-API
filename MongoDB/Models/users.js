import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const usersSchema= mongoose.Schema({
    //אובייקט ההגדרה (Definition)
    id:{
        type:String,
        minLength:9,
        maxLength:9,
        trim:true,
        unique:true,
        required:true,
        validate: {
            validator: (id) => {
                // בדיקה שכל התווים הם ספרות)
                if (!/^\d{9}$/.test(id)) return false;

                let sum = 0;
                for (let i = 0; i < 9; i++) {
                    let digit = Number(id[i]);
                    let weight = (i % 2) + 1;
                    let product = digit * weight;

                    sum += product > 9 ? product - 9 : product;
                }
                return sum % 10 === 0;
            },
            message: 'Invalid ID number'
        }
    },
    name:{
        type:String,
        minLength:2,
        required:true
    },
    birthday:{
        type:Date,
        required:true,
        validate: {
            validator: function(value) {
                const today = new Date();
                let age = today.getFullYear() - value.getFullYear();               
                const monthDiff = today.getMonth() - value.getMonth();              
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < value.getDate())) {
                    age--;
                }
                return age >= 18 && age <= 100;
            },
            message: 'Cannot be under 18 or above 100'
        }
    },
    phone: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                if (v === '' || v === null || v === undefined) {
                    return true;
                }
                return /^05\d{8}$/.test(v);
            },
            message: 'Invalid phone number'
        }
    },
    email:{
        type:String,
        match:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        required:true
    },
    password:{
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(v);
            },
        }
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    },{ 
    //אובייקט הגדרות (Options)
    //פרמטר אופציונלי שבאמצעותו אנחנו מבקשים מ-Mongoose לבצע פעולות מאחורי הקלעים.

    timestamps: true //מתי המסמך נוצר לראשונה ומתי הוא נערך לאחרונה
})

// פעולת ביניים שרצה רגע לפני השמירה למסד הנתונים ומצפינה את הסיסמה
//היא מתבצעת אוטומטית בכל פעם שיוצרים משתמש או מעדכנים ואין צורך לקרוא לה ספציפית 
usersSchema.pre('save', async function() {
    // השורה הזו מוודאת שתוצפן הסיסמה רק אם היא שונתה או נוצרה כעת
    // זה חשוב כדי שלא נצפין בטעות סיסמה שכבר מוצפנת בעת עדכון משתמש
    if (!this.isModified('password')) {
        return; 
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
export default mongoose.model("users",usersSchema)
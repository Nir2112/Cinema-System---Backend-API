import moviesModel from '../MongoDB/Models/movies.js';

// GET - שליפת כל הסרטים
export const getAllMovies = async (req, res) => {
    try {
        const movies = await moviesModel.find({});
        res.status(200).json(movies);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

//*** להוסיף פילטרים לquery.params ***


// GET - שליפת סרט ספציפי לפי מזהה (ID)
export const getMovieById = async (req, res) => {
    try {
        // req.params מכיל את הפרמטרים הדינמיים שנשלחו ב-URL
        const movie = await moviesModel.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({ message: "Movie not found"});
        }
        
        res.status(200).json(movie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// POST - הוספת סרט חדש (עבור מנהל המערכת)
export const createMovie = async (req, res) => {
    try {
        // המידע על הסרט החדש מגיע בתוך גוף הבקשה (req.body)
        const newMovie = await moviesModel.create(req.body);
        res.status(201).json(newMovie); // סטטוס 201 מסמן יצירה מוצלחת של משאב (Created)
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT - עדכון פרטי סרט או שינוי סטטוס (עבור מנהל המערכת)
export const updateMovie = async (req, res) => {
    try {
        const updatedMovie = await moviesModel.findByIdAndUpdate(
            req.params.id,
            req.body,// המידע החדש שנשלח
            {
                new: true, // אומר למונגו להחזיר את הסרט המעודכן ולא את הישן
                runValidators: true// מוודא שהעדכון לא עובר על חוקי הסכמה 
            }
        );

        if (!updatedMovie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        res.status(200).json(updatedMovie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
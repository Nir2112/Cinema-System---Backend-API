import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connect from './mongoDB/connect.js'
import { cronJobs } from './services/cronService.js'

import usersRouter from './routes/usersRoute.js'
import moviesRouter from './routes/moviesRoute.js'
import hallsRouter from './routes/hallsRoute.js'
import screeningsRouter from './routes/screeningsRoute.js'
import ordersRouter from './routes/ordersRoute.js'
import authRouter from './routes/authRoute.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

app.get('/',(req,res)=>{
    res.send('server is working')
})

//--------- connect routes ----------
app.use('/users',usersRouter);
app.use('/movies', moviesRouter);
app.use('/halls', hallsRouter);
app.use('/screenings',screeningsRouter);
app.use('/orders', ordersRouter);
app.use('/auth',authRouter);

// --------- Start Background Tasks ---------
cronJobs();

app.listen(process.env.PORT,'0.0.0.0',()=>{
    console.log(`server is on http://localhost:${process.env.PORT}`);
    connect()
})
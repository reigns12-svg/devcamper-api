const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('./middleware/logger'); 
const errorHandler = require('./middleware/error');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser'); 
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const connectDB = require('./config/db'); 


//env config files
dotenv.config({path:'./config/config.env'});

//connect to database
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app= express();

//Body parser
app.use(express.json());

//Cookie Parser
app.use(cookieParser());

//Dev logging middleware
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'));
}

//File Upload
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//prevent xss attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
 windowMs: 10*60*1000,
 max:100
});

app.use(limiter);

//prevent http param pollution
app.use(hpp());

//enabe cors
app.use(cors());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Mount router files
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',users);
app.use('/api/v1/reviews',reviews);

app.use(errorHandler);

const PORT = process.env.PORT ||5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

//Handle Unhandled Promise Rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error : ${err.message}`);
    //Close Server and exit process
    server.close(()=>process.exit(1));
});
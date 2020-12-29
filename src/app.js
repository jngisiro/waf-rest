import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

import userRouter from './routes/user.routes';
import transactionRouter from './routes/transaction.routes';
import payloadRouter from './routes/payload.routes';
import AppError from './utils/app-error';
import globalErrorHandler from './controllers/error.controller';
import { sendemail } from './utils/sendemail';

const app = express();

// handle rate limit with express-rate-limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from this IP',
});
app.use('/api', limiter);

// configure helmet for securtiy headers
app.use(helmet());

//  configure cors
app.use(cors());
app.options('*', cors());

// Parse request data in the request body into json
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Parse cookies from the request
app.use(cookieParser());

// Data Sanitization from NoSQL injections
app.use(mongoSanitize());

// Data Sanitization from XScripting attacks
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp({ whitelist: ['duration'] }));

// Serve static files in public folder
app.use(express.static('public'));

// send emails from the contact form
app.post('/api/v1/sendemail', sendemail);

// User routes
app.use('/api/v1/users', userRouter);

// Payload Routes
app.use('/api/v1/email', payloadRouter);

// Transaction routes
app.use('/api/v1/transactions', transactionRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find route: ${req.originalUrl}`, 400));
});

// Error handling
app.use(globalErrorHandler);

export default app;

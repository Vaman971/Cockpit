require('dotenv').config(); // MUST be first — loads env vars before anything else

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const { sync } = require('./models/sync');
const { apiLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoute');
const profileRouter = require('./routes/profileRoute');
const oppRouter = require('./routes/opportunityRoute');
const projectRouter = require('./routes/projectRoute');
const missionRouter = require('./routes/missionRoute');
const poRouter = require('./routes/poRoute');
const invoiceRouter = require('./routes/invoiceRoute');
const teamRouter = require('./routes/teamRoute');
const expenseRouter = require('./routes/expenseRoute');
const forecastRouter = require('./routes/forecastRoute');
const revenueRouter = require('./routes/revenueRoute');
const revenueInvoiceRouter = require('./routes/revenueInvoiceRoute');
const extensionRouter = require('./routes/extensionRoute'); // NEW (correct spelling)
const extensionInvoiceRouter = require('./routes/extensionInvoiceRoute'); // NEW (correct spelling)
// DEPRECATED: kept for frontend backward-compatibility — remove once frontend is updated
const extentionRouter = require('./routes/extentionRoute');
const extentionInvoiceRouter = require('./routes/extentionInvoiceRoute');
const savingsRouter = require('./routes/savingRoute');
const analyticsRouter = require('./routes/analyticsRoute');
const currencyRouter = require('./routes/currencyRoute');
const financeRouter = require('./routes/financeRoute');
const newFinanceRouter = require('./routes/newFinanceRoute');
const customerRouter = require('./routes/customerRoute');
const sharePointRouter = require('./routes/sharePointRoute');

const app = express();

// ─── Database Sync ──────────────────────────────────────────────────────────
sync();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// ─── Core Middlewares ────────────────────────────────────────────────────────
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── General Rate Limiting ───────────────────────────────────────────────────
app.use(apiLimiter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/oppurtunities', oppRouter);
app.use('/project', projectRouter);
app.use('/mission', missionRouter);
app.use('/po', poRouter);
app.use('/invoice', invoiceRouter);
app.use('/expense', expenseRouter);
app.use('/forecast', forecastRouter);
app.use('/revenue', revenueRouter);
app.use('/revenueInvoice', revenueInvoiceRouter);
app.use('/extension', extensionRouter); // canonical (new spelling)
app.use('/extensionInvoice', extensionInvoiceRouter); // canonical (new spelling)
// DEPRECATED — kept for frontend backward-compatibility
app.use('/extention', extentionRouter);
app.use('/extentionInvoice', extentionInvoiceRouter);
app.use('/saving', savingsRouter);
app.use('/profile', profileRouter);
app.use('/teams', teamRouter);
app.use('/analytics', analyticsRouter);
app.use('/currency', currencyRouter);
app.use('/finance', financeRouter);
app.use('/newFinance', newFinanceRouter);
app.use('/customer', customerRouter);
app.use('/sharePoint', sharePointRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: { message: 'Route not found' } });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

module.exports = app; // export for testing

import express, { type Express, type Request, type Response } from 'express';
import { userRouter } from './routes/users.route.js';
import { authRouter } from './routes/auth.route.js';
import { issueRouter } from './routes/issue.route.js';
import { ensureDefaultAdmin } from './db/seed-admin.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { dashboardRouter } from './routes/dashboard.route.js';
import { notificationRouter } from './routes/notification.route.js';

const app: Express = express();
const PORT = 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true}));
app.use(express.json());
app.use(cookieParser());

// rotte
app.use('/users', userRouter);
app.use('/auth', authRouter);

app.use('/issues', issueRouter);

app.use('/dashboard', dashboardRouter);

app.use('/notification', notificationRouter);

async function bootstrap() {
  await ensureDefaultAdmin();
  app.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}...`));
}

bootstrap().catch((err) => {
  console.error('Avvio fallito: ', err);
  process.exit(1);
});



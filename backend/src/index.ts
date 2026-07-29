import express, { type Express, type Request, type Response } from 'express';
import { userRouter } from './routes/users.route.js';
import { ensureDefaultAdmin } from './db/seed-admin.js';

const app: Express = express();
const PORT = 3000;

app.use(express.json());

// rotte
app.use('/users', userRouter);

async function bootstrap() {
  await ensureDefaultAdmin();
  app.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}...`));
}

bootstrap().catch((err) => {
  console.error('Avvio fallito: ', err);
  process.exit(1);
})



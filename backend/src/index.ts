import express, { type Express, type Request, type Response } from 'express';
import { userRouter } from './routes/users.route.js';

const app: Express = express();
const PORT = 3000;

app.use(express.json());

// rotte
app.use('/users', userRouter);

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}...`);
});



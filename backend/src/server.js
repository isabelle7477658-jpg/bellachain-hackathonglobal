import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { tratarErro } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = (process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173'))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bella-chain-backend' });
});

app.use('/api', apiRoutes);

// Middleware de tratamento de erros (deve estar por último)
app.use(tratarErro);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`API documentation: http://localhost:${port}/api`);
});

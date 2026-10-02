import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { tratarErro } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
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

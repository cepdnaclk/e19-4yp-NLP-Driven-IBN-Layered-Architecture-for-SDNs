import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import intentRoutes from './routes/intents.js';
import qosRoutes from './routes/qos.js';
import monitoringRoutes from './routes/monitoring.js';
import { port } from './config/config.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/intents', intentRoutes);
app.use('/api/qos', qosRoutes);
app.use('/api/monitoring', monitoringRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
import express from 'express';
import os from 'os';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import systemRoutes from './src/routes/systemRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import attendanceRoutes from './src/routes/attendanceRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import { getAiConfig } from './src/services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Định tuyến API
app.use('/api/system', systemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Phục vụ giao diện Frontend (Static files)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Hỗ trợ SPA: Mọi đường dẫn không phải API sẽ được trỏ về index.html
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
        res.status(404).json({ success: false, message: 'API endpoint không tồn tại', data: null });
    }
});

// Khởi động Server
app.listen(PORT, async () => {
  const username = os.userInfo().username;
  const hostname = os.hostname();
  const currentDir = process.cwd();
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Khởi động bởi: ${username} (Máy tính: ${hostname})`);
  console.log(`Khởi động tại: ${currentDir}`);

  // Kiểm tra kết nối Ollama
  try {
    const aiConfig = await getAiConfig();
    const ollamaResponse = await fetch(`${aiConfig.host}/api/version`);
    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      console.log(`Connected to Ollama AI at ${aiConfig.host} (Version: ${data.version}, Model: ${aiConfig.model})`);
    } else {
      console.log(`Warning: Ollama at ${aiConfig.host} returned status ${ollamaResponse.status}`);
    }
  } catch (error) {
    console.log(`Warning: Cannot connect to Ollama AI. Please ensure Ollama is running.`);
  }
});

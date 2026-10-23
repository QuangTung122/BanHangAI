import 'dotenv/config';
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
import auditRoutes from './src/routes/auditRoutes.js';
import returnRoutes from './src/routes/returnRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import botRoutes from './src/routes/botRoutes.js';
import botSupportRoutes from './src/routes/botSupportRoutes.js';
import { getAiConfig } from './src/services/aiService.js';
import { ensureKnowledgeSynced } from './src/services/botKnowledgeService.js';
import activityNotificationMiddleware from './src/middlewares/activityNotificationMiddleware.js';
import { expireBotReservations } from './src/services/botReservationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.use(activityNotificationMiddleware);

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
app.use('/api/bot', botRoutes);
app.use('/api/bot/support', botSupportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', returnRoutes);

// Phục vụ giao diện Frontend (Static files)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Phục vụ thư mục uploads (Static files)
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

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

  // Bot dùng Gemini (LangChain.js) + RAG
  if (process.env.GEMINI_API_KEY) {
    const aiConfig = await getAiConfig();
    console.log(`Bot AI: Gemini (model: ${aiConfig.model}, chế độ model: ${aiConfig.model_mode}, cấu hình hệ thống: ${aiConfig.provider})`);
  } else {
    console.log('Warning: Thiếu GEMINI_API_KEY trong .env, Bot sẽ không trả lời được câu hỏi tự nhiên.');
  }
  ensureKnowledgeSynced().then(() => console.log('Bot RAG: tri thức đã sẵn sàng.'));
  const expireReservations = () => expireBotReservations().catch((error) => console.error('Không thể giải phóng đơn bot quá hạn:', error.message));
  expireReservations();
  setInterval(expireReservations, 60 * 1000).unref();
});

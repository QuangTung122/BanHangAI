import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import * as attendanceController from '../controllers/attendanceController.js';

const router = express.Router();

router.use(requireAuth);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/my-records', attendanceController.getMyAttendance);
router.get('/all', attendanceController.getAllAttendance); // Cho Owner

export default router;

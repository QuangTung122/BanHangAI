import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.resolve(__dirname, '../../uploads/chat');
fs.mkdirSync(uploadDirectory, { recursive: true });

const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const upload = multer({
    storage: multer.diskStorage({
        destination: uploadDirectory,
        filename: (_req, file, callback) => callback(null, `${Date.now()}-${randomUUID()}${extensions[file.mimetype]}`)
    }),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, callback) => callback(
        extensions[file.mimetype] ? null : new Error('Chỉ nhận ảnh JPG, PNG hoặc WEBP.'),
        Boolean(extensions[file.mimetype])
    )
});

export const uploadChatImage = (req, res, next) => upload.single('image')(req, res, (error) => {
    if (!error) return next();
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Ảnh không được vượt quá 5 MB.' : error.message;
    return res.status(400).json({ success: false, message, data: null });
});

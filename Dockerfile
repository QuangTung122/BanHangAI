# Sử dụng base image Node.js 18
FROM node:18-alpine

WORKDIR /app

# Copy thư mục backend (chứa package.json)
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy toàn bộ mã nguồn
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Cấu hình môi trường
ENV PORT=5000
EXPOSE 5000

# Chạy server
CMD ["node", "backend/server.js"]

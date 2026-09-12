# Hướng dẫn Triển khai & Đóng gói (Deployment Guide)

Dự án có thể được triển khai theo 2 cách: Chạy trực tiếp (Local) và Đóng gói Container (Docker).

---

## 1. Triển khai Local (Dành cho môi trường Dev)

Yêu cầu phần cứng: RAM >= 8GB (để chạy mượt Ollama LLM).

**Bước 1: Cài đặt công cụ lõi**

- Cài đặt [Node.js](https://nodejs.org) (phiên bản v18+).
- Cài đặt [Ollama](https://ollama.com).

**Bước 2: Chuẩn bị mô hình Trí tuệ Nhân tạo**
Mở Terminal/Command Prompt chạy lệnh sau để tải mô hình ngôn ngữ `qwen2.5-coder` (hoặc có thể dùng `llama3`):

```bash
ollama run qwen2.5-coder:1.5b
```

**Bước 3: Chạy Backend & Frontend**

```bash
cd backend
npm install
npm start
```

*Ghi chú:* Vì ứng dụng dùng chung port, Express API sẽ tự động phục vụ file tĩnh của Frontend tại `http://localhost:5000`.

---

## 2. Triển khai bằng Docker (Dành cho môi trường Production/VPS)

Đóng gói dự án vào Docker giúp dự án có thể chạy trên mọi máy chủ Linux/Windows mà không cần cài thủ công Node.js hay Ollama.

**Bước 1: Tạo file `Dockerfile` (Bỏ vào thư mục gốc)**

```dockerfile
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
```

**Bước 2: Tạo file `docker-compose.yml` (Bỏ vào thư mục gốc)**

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - OLLAMA_HOST=http://ollama:11434
    depends_on:
      - ollama

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

volumes:
  ollama_data:
```

**Bước 3: Chạy Docker Compose**
Tại thư mục gốc của dự án, mở terminal chạy lệnh:

```bash
docker-compose up -d --build
```

**Bước 4 (Quan trọng): Nạp Model vào Container Ollama**
Sau khi container chạy lên, bạn cần bắt Docker tải model AI vào bên trong container `ollama`:

```bash
docker exec -it <tên_container_ollama> ollama run qwen2.5-coder:1.5b
```

Từ giờ trở đi, hệ thống web tại `localhost:5000` sẽ giao tiếp tự động với AI thông qua hostname `http://ollama:11434`.

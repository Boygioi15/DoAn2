# Hướng dẫn Setup Domain silkshop.online

## Tổng quan

Tất cả chạy trên cùng domain `silkshop.online` với path-based routing:

- **Frontend Client**: `silkshop.online` → port 5174
- **Admin Panel**: `silkshop.online/admin` → port 5173  
- **Backend API**: `silkshop.online/api` → port 3000

EC2 IP: `52.63.110.114`

## Bước 1: Cấu hình DNS

Trên nhà cung cấp domain của bạn, chỉ cần thêm 2 A records:

```
Type    Name    Value           TTL
A       @       52.63.110.114   3600
A       www     52.63.110.114   3600
```

**Lưu ý**: 
- Thay `@` bằng domain gốc (silkshop.online)
- Đợi 5-30 phút để DNS propagate

**Kiểm tra DNS:**
```bash
nslookup silkshop.online
nslookup www.silkshop.online
```

## Bước 2: Setup trên EC2

### Cách 1: Dùng script tự động (Khuyến nghị)

```bash
# SSH vào EC2
ssh ubuntu@52.63.110.114

# Copy script lên EC2
# (Từ máy local)
scp docker/setup-silkshop.sh ubuntu@52.63.110.114:/home/ubuntu/

# Chạy script trên EC2
chmod +x setup-silkshop.sh
./setup-silkshop.sh
```

### Cách 2: Setup thủ công

```bash
# SSH vào EC2
ssh ubuntu@52.63.110.114

# 1. Cài đặt Nginx
sudo apt update
sudo apt install nginx -y

# 2. Copy file cấu hình
# Từ máy local:
scp docker/nginx-silkshop.conf ubuntu@52.63.110.114:/tmp/nginx-silkshop.conf

# Trên EC2:
sudo cp nginx-silkshop.conf /etc/nginx/sites-available/silkshop

# Hoặc tạo trực tiếp:
sudo nano /etc/nginx/sites-available/silkshop
# Copy nội dung từ nginx-silkshop.conf

# 3. Enable site
sudo ln -s /etc/nginx/sites-available/silkshop /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# 4. Test và restart
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Bước 3: Mở Port 80 và 443 trên EC2 Security Group

1. Vào AWS Console → EC2 → Security Groups
2. Chọn Security Group của EC2 instance
3. Inbound rules → Edit
4. Thêm rules:
   - Type: **HTTP**, Port: **80**, Source: **0.0.0.0/0**
   - Type: **HTTPS**, Port: **443**, Source: **0.0.0.0/0**

## Bước 4: Cài đặt SSL (Let's Encrypt)

Sau khi DNS đã propagate (kiểm tra bằng `nslookup`):

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx -y

# Lấy SSL certificate cho domain
sudo certbot --nginx -d silkshop.online -d www.silkshop.online
```

Certbot sẽ tự động:
- Tạo SSL certificates
- Cập nhật nginx config để dùng HTTPS
- Thiết lập auto-renewal

**Test auto-renewal:**
```bash
sudo certbot renew --dry-run
```

## Bước 5: Cập nhật Frontend để dùng Domain API

Cần rebuild frontend với API URL mới.

### Trên máy local:

#### Option 1: Sửa build script

Sửa file `build-images.sh` hoặc tạo file `.env`:

```bash
# frontend-admin/.env
VITE_API_URL=https://silkshop.online/api

# frontend-client/.env  
VITE_API_URL=https://silkshop.online/api
```

#### Option 2: Rebuild với build arg

Sửa `build-images.sh` để dùng build arg:

```bash
# Trong build-images.sh, thay đổi:
docker build --build-arg VITE_API_URL=https://silkshop.online/api -t frontend-admin:${TAG} .
docker build --build-arg VITE_API_URL=https://silkshop.online/api -t frontend-client:${TAG} .
```

Sau đó rebuild và push:

```bash
cd docker
./deploy-dockerhub.sh hoangquy18 latest
```

## Bước 6: Cập nhật Backend CORS

Cần cập nhật CORS trong backend để cho phép domain mới.

Sửa file `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'https://silkshop.online',
    'https://www.silkshop.online',
    'http://localhost:5173',  // Giữ cho local dev
    'http://localhost:5174',  // Giữ cho local dev
  ],
  credentials: true,
});
```

Sau đó rebuild và push backend:

```bash
cd docker
./deploy-dockerhub.sh hoangquy18 latest
```

## Bước 7: Deploy lại trên EC2

```bash
# SSH vào EC2
ssh ubuntu@52.63.110.114

# Pull images mới
cd docker
docker login
REGISTRY=hoangquy18 TAG=latest docker-compose -f docker-compose.prod.yml pull

# Restart containers
REGISTRY=hoangquy18 TAG=latest docker-compose -f docker-compose.prod.yml up -d

# Kiểm tra logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Kiểm tra

Sau khi setup xong, truy cập:

- ✅ Frontend: https://silkshop.online
- ✅ Admin: https://silkshop.online/admin
- ✅ API: https://silkshop.online/api

## Troubleshooting

### Nginx không start
```bash
sudo nginx -t  # Kiểm tra config
sudo journalctl -u nginx -n 50  # Xem logs
```

### Domain không resolve
```bash
# Kiểm tra DNS
dig silkshop.online
nslookup silkshop.online
nslookup www.silkshop.online

# Kiểm tra Nginx đang listen
sudo netstat -tlnp | grep nginx
```

### Backend không kết nối được
```bash
# Kiểm tra backend logs
docker logs backend-container

# Test API từ server
curl http://localhost:3000
curl http://silkshop.online/api
```

### SSL certificate issues
```bash
# Kiểm tra certificates
sudo certbot certificates

# Renew manually
sudo certbot renew

# Xem nginx config sau khi certbot
sudo cat /etc/nginx/sites-available/silkshop
```

### 502 Bad Gateway
```bash
# Kiểm tra containers đang chạy
docker ps

# Kiểm tra logs
docker-compose -f docker-compose.prod.yml logs

# Test upstream từ server
curl http://localhost:3000  # Backend
curl http://localhost:5173  # Admin
curl http://localhost:5174  # Client
```

## Tóm tắt nhanh

```bash
# 1. Setup DNS trên domain provider (A records → 52.63.110.114)

# 2. Trên EC2 - Setup Nginx
ssh ubuntu@52.63.110.114
./setup-silkshop.sh

# 3. Setup SSL (sau khi DNS propagate)
sudo certbot --nginx -d silkshop.online -d www.silkshop.online

# 4. Rebuild frontend với API URL mới (trên máy local)
# Sửa VITE_API_URL=https://silkshop.online/api
cd docker
./deploy-dockerhub.sh hoangquy18 latest

# 5. Update backend CORS và rebuild (trên máy local)
# Sửa main.ts với domain mới
cd docker
./deploy-dockerhub.sh hoangquy18 latest

# 6. Deploy lại trên EC2
cd docker
docker login
REGISTRY=hoangquy18 TAG=latest docker-compose -f docker-compose.prod.yml pull
REGISTRY=hoangquy18 TAG=latest docker-compose -f docker-compose.prod.yml up -d
```

